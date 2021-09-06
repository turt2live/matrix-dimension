import { Context, GET, Path, POST, QueryParam, Security, ServiceContext } from "typescript-rest";
import { ApiError } from "../ApiError";
import { OpenId } from "../../models/OpenId";
import { ScalarAccountResponse, ScalarRegisterResponse } from "../../models/ScalarResponses";
import AccountController from "../controllers/AccountController";
import { ROLE_USER } from "../security/MatrixSecurity";
import TermsController, { ITermsResponse } from "../controllers/TermsController";
import { SignTermsRequest } from "../matrix/MatrixTermsService";
import { ScalarClient } from "../../scalar/ScalarClient";

/**
 * API for the minimum Scalar API we need to implement to be compatible with clients. Used for registration
 * and general account management.
 */
@Path("/api/v1/scalar")
export class ScalarService {

    @Context
    private context: ServiceContext;

    @POST
    @Path("register")
    public async register(request: OpenId, @QueryParam("v") apiVersion: string): Promise<ScalarRegisterResponse> {
        if (apiVersion !== "1.1") {
            throw new ApiError(401, "Invalid API version.");
        }

        const response = await new AccountController().registerAccount(request, ScalarClient.KIND_LEGACY);
        return {scalar_token: response.token};
    }

    @GET
    @Path("account")
    @Security(ROLE_USER)
    public async getAccount(@QueryParam("v") apiVersion: string): Promise<ScalarAccountResponse> {
        if (apiVersion !== "1.1") {
            throw new ApiError(401, "Invalid API version.");
        }

        return {user_id: this.context.request.user.userId};
    }

    @GET
    @Path("terms")
    public async getTerms(): Promise<ITermsResponse> {
        return new TermsController().getAvailableTerms();
    }

    @POST
    @Path("terms")
    @Security(ROLE_USER)
    public async signTerms(request: SignTermsRequest): Promise<any> {
        await new TermsController().signTermsMatching(this.context.request.user, request.user_accepts);
        return {};
    }

    @GET
    @Path("ping")
    public async ping(): Promise<any> {
        return {}; // 200 OK
    }

}