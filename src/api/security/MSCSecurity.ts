import { ServiceAuthenticator } from "typescript-rest";
import { Request, RequestHandler, Response, Router } from "express";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-js-snippets";
import AccountController from "../controllers/AccountController";
import TermsController from "../controllers/TermsController";
import config from "../../config";

export interface IMSCUser {
    userId: string;
    token: string;
}

export const ROLE_MSC_USER = "ROLE_MSC_USER";
export const ROLE_MSC_ADMIN = "ROLE_MSC_ADMIN";

const TERMS_IGNORED_ROUTES = [
    {method: "*", path: "/api/v1/dimension/admin/"},
    {method: "GET", path: "/_matrix/integrations/v1/terms"},
    {method: "POST", path: "/_matrix/integrations/v1/terms"},
    {method: "POST", path: "/_matrix/integrations/v1/register"},
    {method: "POST", path: "/_matrix/integrations/v1/logout"},
];

export default class MSCSecurity implements ServiceAuthenticator {

    private accountController = new AccountController();
    private termsController = new TermsController();

    public getRoles(req: Request): string[] {
        if (req.user) {
            const roles = [ROLE_MSC_USER];
            if (config.admins.includes(req.user.userId)) {
                roles.push(ROLE_MSC_ADMIN);
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
                    LogService.warn("MSCSecurity", "Request used old scalar_token auth - this will be removed in a future version");
                    token = req.query.scalar_token;
                }

                if (token) {
                    req.user = <IMSCUser>{
                        userId: await this.accountController.getTokenOwner(token),
                        token: token,
                    };

                    let needTerms = true;
                    if (req.method !== "OPTIONS") {
                        for (const route of TERMS_IGNORED_ROUTES) {
                            if (route.method === "*" && req.path.startsWith(route.path)) {
                                needTerms = false;
                                break;
                            }
                            if (route.method === req.method && route.path === req.path) {
                                needTerms = false;
                                break;
                            }
                        }
                    } else needTerms = false;

                    if (needTerms) {
                        const signatureNeeded = await this.termsController.doesUserNeedToSignTerms(req.user);
                        if (signatureNeeded) {
                            return res.status(403).json({
                                errcode: "M_TERMS_NOT_SIGNED",
                                error: "The user has not accepted all terms of service for this integration manager",
                            });
                        }
                    }

                    return next();
                } else {
                    return res.status(401).json({errcode: "M_INVALID_TOKEN", error: "Invalid token"});
                }
            } catch (e) {
                if (e instanceof ApiError) {
                    // TODO: Proper error message
                    res.status(e.statusCode).json({errcode: e.errorCode, error: "Error"});
                } else {
                    LogService.error("MSCSecurity", e);
                    res.status(500).json({errcode: "M_UNKNOWN", error: "Unknown server error"});
                }
            }
        });
    }

    public initialize(_router: Router): void {
    }

}