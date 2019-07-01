import { Context, GET, Path, Security, ServiceContext } from "typescript-rest";
import { AutoWired, Inject } from "typescript-ioc/es6";
import { ROLE_MSC_USER } from "../security/MSCSecurity";
import TermsController, { ITermsNotSignedResponse } from "../controllers/TermsController";

/**
 * API for account management
 */
@Path("/_matrix/integrations/v1/terms")
@AutoWired
export class MSCTermsService {

    @Inject
    private termsController: TermsController;

    @Context
    private context: ServiceContext;

    @GET
    @Path("")
    @Security(ROLE_MSC_USER)
    public async needsSignatures(): Promise<ITermsNotSignedResponse> {
        return this.termsController.getMissingTermsForUser(this.context.request.user);
    }
}