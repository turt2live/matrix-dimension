import { GET, Path, PathParam, POST, PUT, Security } from "typescript-rest";
import TermsController, { ITerms } from "../controllers/TermsController";
import { AutoWired, Inject } from "typescript-ioc/es6";
import { ROLE_ADMIN, ROLE_USER } from "../security/MatrixSecurity";

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
    @Security([ROLE_USER, ROLE_ADMIN])
    public async getPolicies(): Promise<ITerms[]> {
        return this.termsController.getPoliciesForAdmin();
    }

    @GET
    @Path(":shortcode/:version")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async getPolicy(@PathParam("shortcode") shortcode: string, @PathParam("version") version: string): Promise<ITerms> {
        return this.termsController.getPolicyForAdmin(shortcode, version);
    }

    @POST
    @Path(":shortcode/draft")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async createDraftPolicy(@PathParam("shortcode") shortcode: string, request: CreatePolicyObject): Promise<ITerms> {
        return this.termsController.createDraftPolicy(request.name, shortcode, request.text, request.url);
    }

    @POST
    @Path(":shortcode/publish/:version")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async publishDraftPolicy(@PathParam("shortcode") shortcode: string, @PathParam("version") version: string): Promise<ITerms> {
        return this.termsController.publishPolicy(shortcode, version);
    }

    @PUT
    @Path(":shortcode/:version")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async updatePolicy(@PathParam("shortcode") shortcode: string, @PathParam("version") version: string, request: CreatePolicyObject): Promise<ITerms> {
        return this.termsController.updatePolicy(request.name, shortcode, version, request.text, request.url);
    }
}