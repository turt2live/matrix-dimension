import { GET, Path, POST, QueryParam } from "typescript-rest";
import { ApiError } from "../ApiError";
import { OpenId } from "../../models/OpenId";
import { ScalarAccountResponse, ScalarRegisterResponse } from "../../models/ScalarResponses";
import { AutoWired, Inject } from "typescript-ioc/es6";
import AccountController from "../controllers/AccountController";

/**
 * API for the minimum Scalar API we need to implement to be compatible with clients. Used for registration
 * and general account management.
 */
@Path("/api/v1/scalar")
@AutoWired
export class ScalarService {

    @Inject
    private accountController: AccountController;

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
    public async getAccount(@QueryParam("scalar_token") scalarToken: string, @QueryParam("v") apiVersion: string): Promise<ScalarAccountResponse> {
        if (apiVersion !== "1.1") {
            throw new ApiError(401, "Invalid API version.");
        }

        const userId = await this.accountController.getTokenOwner(scalarToken);
        return {user_id: userId};
    }

    @GET
    @Path("ping")
    public async ping(): Promise<any> {
        return {}; // 200 OK
    }

}