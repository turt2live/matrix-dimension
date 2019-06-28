import { ServiceAuthenticator } from "typescript-rest";
import { Request, RequestHandler, Response, Router } from "express";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-js-snippets";
import AccountController from "../controllers/AccountController";

export interface IMSCUser {
    userId: string;
    token: string;
}

export const ROLE_MSC_USER = "ROLE_MSC_USER";

export default class MSCSecurity implements ServiceAuthenticator {

    private accountController = new AccountController();

    public getRoles(req: Request): string[] {
        if (req.user) return [ROLE_MSC_USER];
        return [];
    }

    getMiddleware(): RequestHandler {
        return (async (req: Request, res: Response, next: () => void) => {
            try {
                if (req.headers.authorization) {
                    const header = req.headers.authorization;
                    if (!header.startsWith("Bearer ")) {
                        return res.status(401).json({errcode: "M_INVALID_TOKEN", error: "Invalid token"});
                    }

                    const token = header.substring("Bearer ".length);
                    req.user = <IMSCUser>{
                        userId: await this.accountController.getTokenOwner(token),
                        token: token,
                    };
                    return next();
                }

                console.log(req.query);
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

    initialize(_router: Router): void {
    }

}