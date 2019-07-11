import { ServiceAuthenticator } from "typescript-rest";
import { Request, RequestHandler, Response, Router } from "express";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-js-snippets";
import AccountController from "../controllers/AccountController";
import TermsController from "../controllers/TermsController";
import config from "../../config";
import { ScalarStore } from "../../db/ScalarStore";
import { ScalarClient } from "../../scalar/ScalarClient";

export interface ILoggedInUser {
    userId: string;
    token: string;
}

export const ROLE_USER = "ROLE_USER";
export const ROLE_ADMIN = "ROLE_ADMIN";

const TERMS_IGNORED_ROUTES = [
    {method: "*", path: "/api/v1/dimension/admin/"},
    {method: "GET", path: "/_matrix/integrations/v1/terms"},
    {method: "POST", path: "/_matrix/integrations/v1/terms"},
    {method: "POST", path: "/_matrix/integrations/v1/register"},
    {method: "POST", path: "/_matrix/integrations/v1/logout"},

    // Legacy scalar routes
    {method: "GET", path: "/api/v1/scalar/terms"},
    {method: "POST", path: "/api/v1/scalar/terms"},
    {method: "POST", path: "/api/v1/scalar/register"},
];

const ADMIN_ROUTES = [
    {method: "*", path: "/api/v1/dimension/admin/"},
];

export default class MatrixSecurity implements ServiceAuthenticator {

    private accountController = new AccountController();
    private termsController = new TermsController();

    public getRoles(req: Request): string[] {
        if (req.user) {
            const roles = [ROLE_USER];
            if (config.admins.includes(req.user.userId)) {
                roles.push(ROLE_ADMIN);
            }
            return roles;
        }
        return [];
    }

    public getMiddleware(): RequestHandler {
        return (async (req: Request, res: Response, next: () => void) => {
            try {
                let token = null;

                if (req.headers.authorization) {
                    const header = req.headers.authorization;
                    if (!header.startsWith("Bearer ")) {
                        return res.status(401).json({errcode: "M_INVALID_TOKEN", error: "Invalid token"});
                    }
                    token = header.substring("Bearer ".length);
                } else if (req.query && req.query.access_token) {
                    token = req.query.access_token;
                } else if (req.query && req.query.scalar_token) {
                    LogService.warn("MatrixSecurity", "Request used old scalar_token auth - this will be removed in a future version");
                    token = req.query.scalar_token;
                }

                if (token) {
                    req.user = <ILoggedInUser>{
                        userId: await this.accountController.getTokenOwner(token),
                        token: token,
                    };

                    const needUpstreams = !this.matchesAnyRoute(req, ADMIN_ROUTES);
                    if (needUpstreams) {
                        const scalarKind = req.path.startsWith("/_matrix/integrations/v1/") ? ScalarClient.KIND_MATRIX_V1 : ScalarClient.KIND_LEGACY;
                        const hasUpstreams = await ScalarStore.doesUserHaveTokensForAllUpstreams(req.user.userId, scalarKind);
                        if (!hasUpstreams) {
                            return res.status(401).json({errcode: "M_INVALID_TOKEN", error: "Invalid token"});
                        }
                    }

                    const needTerms = !this.matchesAnyRoute(req, TERMS_IGNORED_ROUTES);
                    if (needTerms) {
                        const signatureNeeded = await this.termsController.doesUserNeedToSignTerms(req.user);
                        if (signatureNeeded) {
                            return res.status(403).json({
                                errcode: "M_TERMS_NOT_SIGNED",
                                error: "The user has not accepted all terms of service for this integration manager",
                            });
                        }
                    }

                    if (this.matchesAnyRoute(req, ADMIN_ROUTES, false) && !this.getRoles(req).includes(ROLE_ADMIN)) {
                        return res.status(403).json({errcode: "M_UNAUTHORIZED", error: "User is not an admin"});
                    }

                    return next();
                } else {
                    return res.status(401).json({errcode: "M_INVALID_TOKEN", error: "Invalid token"});
                }
            } catch (e) {
                if (e instanceof ApiError) {
                    res.status(e.statusCode).json(e.jsonResponse);
                } else {
                    LogService.error("MatrixSecurity", e);
                    res.status(500).json({errcode: "M_UNKNOWN", error: "Unknown server error"});
                }
            }
        });
    }

    public initialize(_router: Router): void {
    }

    private matchesAnyRoute(req: Request, routes: { method: string, path: string }[], valForOptions = true): boolean {
        if (req.method === 'OPTIONS') return valForOptions;

        for (const route of routes) {
            if (route.method === '*' && req.path.startsWith(route.path)) {
                return true;
            }
            if (route.method === req.method && route.path === req.path) {
                return true;
            }
        }

        return false;
    }

}