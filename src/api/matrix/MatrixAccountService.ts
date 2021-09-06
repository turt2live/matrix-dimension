import { Context, GET, Path, POST, Security, ServiceContext } from "typescript-rest";
import { OpenId } from "../../models/OpenId";
import AccountController, { IAccountInfoResponse, IAccountRegisteredResponse } from "../controllers/AccountController";
import { ILoggedInUser, ROLE_USER } from "../security/MatrixSecurity";
import { ScalarClient } from "../../scalar/ScalarClient";

/**
 * API for account management
 */
@Path("/_matrix/integrations/v1/account")
export class MatrixAccountService {

    @Context
    private context: ServiceContext;

    @POST
    @Path("register")
    public async register(request: OpenId): Promise<IAccountRegisteredResponse> {
        return new AccountController().registerAccount(request, ScalarClient.KIND_MATRIX_V1);
    }

    @GET
    @Path("")
    @Security(ROLE_USER)
    public async info(): Promise<IAccountInfoResponse> {
        const user: ILoggedInUser = this.context.request.user;
        return {user_id: user.userId};
    }

    @POST
    @Path("logout")
    @Security(ROLE_USER)
    public async logout(): Promise<any> {
        await new AccountController().logout(this.context.request.user);
        return {};
    }
}