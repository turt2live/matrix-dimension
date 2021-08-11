import { Context, GET, Path, POST, Security, ServiceContext } from "typescript-rest";
import { ROLE_USER } from "../security/MatrixSecurity";
import TermsController, { ITermsResponse } from "../controllers/TermsController";

export interface SignTermsRequest {
    user_accepts: string[];
}

/**
 * API for account management
 */
@Path("/_matrix/integrations/v1/terms")
export class MatrixTermsService {

    @Context
    private context: ServiceContext;

    @GET
    @Path("")
    public async getAllTerms(): Promise<ITermsResponse> {
        return new TermsController().getAvailableTerms();
    }

    @POST
    @Path("")
    @Security(ROLE_USER)
    public async signTerms(request: SignTermsRequest): Promise<any> {
        await new TermsController().signTermsMatching(this.context.request.user, request.user_accepts);
        return {};
    }
}