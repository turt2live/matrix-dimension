import { Context, GET, Path, POST, QueryParam, Security, ServiceContext } from "typescript-rest";
import { ApiError } from "../ApiError";
import { OpenId } from "../../models/OpenId";
import { ScalarAccountResponse, ScalarRegisterResponse } from "../../models/ScalarResponses";
import { AutoWired, Inject } from "typescript-ioc/es6";
import AccountController from "../controllers/AccountController";
import { ROLE_MSC_USER } from "../security/MSCSecurity";

/**
 * API for the minimum Scalar API we need to implement to be compatible with clients. Used for registration
 * and general account management.
 */
@Path("/api/v1/scalar")
@AutoWired
export class ScalarService {

    @Inject
    private accountController: AccountController;

    @Context
    private context: ServiceContext;

    @POST
    @Path("register")
    public async register(request: OpenId, @QueryParam("v") apiVersion: string): Promise<ScalarRegisterResponse> {
        if (apiVersion !== "1.1") {
            throw new ApiError(401, "Invalid API version.");
        }

        const response = await this.accountController.registerAccount(request);
        return {scalar_token: response.token};
    }

    @GET
    @Path("account")
    @Security(ROLE_MSC_USER)
    public async getAccount(@QueryParam("v") apiVersion: string): Promise<ScalarAccountResponse> {
        if (apiVersion !== "1.1") {
            throw new ApiError(401, "Invalid API version.");
        }

        return {user_id: this.context.request.user.userId};
    }

    @GET
    @Path("ping")
    public async ping(): Promise<any> {
        return {}; // 200 OK
    }

}