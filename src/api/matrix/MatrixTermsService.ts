import { Context, GET, Path, POST, Security, ServiceContext } from "typescript-rest";
import { AutoWired, Inject } from "typescript-ioc/es6";
import { ROLE_USER } from "../security/MatrixSecurity";
import TermsController, { ITermsNotSignedResponse } from "../controllers/TermsController";

export interface SignTermsRequest {
    user_accepts: string[];
}

/**
 * API for account management
 */
@Path("/_matrix/integrations/v1/terms")
@AutoWired
export class MatrixTermsService {

    @Inject
    private termsController: TermsController;

    @Context
    private context: ServiceContext;

    @GET
    @Path("")
    @Security(ROLE_USER)
    public async needsSignatures(): Promise<ITermsNotSignedResponse> {
        return this.termsController.getMissingTermsForUser(this.context.request.user);
    }

    @POST
    @Path("")
    @Security(ROLE_USER)
    public async signTerms(request: SignTermsRequest): Promise<any> {
        await this.termsController.signTermsMatching(this.context.request.user, request.user_accepts);
        return {};
    }
}