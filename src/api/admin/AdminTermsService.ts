import { GET, Path, PathParam, POST, Security } from "typescript-rest";
import TermsController, { ITerms } from "../controllers/TermsController";
import { AutoWired, Inject } from "typescript-ioc/es6";
import { ROLE_MSC_ADMIN, ROLE_MSC_USER } from "../security/MSCSecurity";

interface CreatePolicyObject {
    name: string;
    text?: string;
    url: string;
}

/**
 * Administrative API for configuring terms of service.
 */
@Path("/api/v1/dimension/admin/terms")
@AutoWired
export class AdminTermsService {

    @Inject
    private termsController: TermsController;

    @GET
    @Path("all")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async getPolicies(): Promise<ITerms[]> {
        return this.termsController.getPoliciesForAdmin();
    }

    @GET
    @Path(":shortcode/:version")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async getPolicy(@PathParam("shortcode") shortcode: string, @PathParam("version") version: string): Promise<ITerms> {
        return this.termsController.getPolicyForAdmin(shortcode, version);
    }

    @POST
    @Path(":shortcode/draft")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async createDraftPolicy(@PathParam("shortcode") shortcode: string, request: CreatePolicyObject): Promise<ITerms> {
        return this.termsController.createDraftPolicy(request.name, shortcode, request.text, request.url);
    }
}