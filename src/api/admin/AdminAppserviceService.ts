import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { AdminService } from "./AdminService";
import AppService from "../../db/models/AppService";
import { AppserviceStore } from "../../db/AppserviceStore";
import { ApiError } from "../ApiError";
import { MatrixAppserviceClient } from "../../matrix/MatrixAppserviceClient";
import { LogService } from "matrix-js-snippets";

interface AppserviceResponse {
    id: string;
    hsToken: string;
    asToken: string;
    userPrefix: string;
}

interface AppserviceCreateRequest {
    userPrefix: string;
}

/**
 * Administrative API for managing the appservices that Dimension operates.
 */
@Path("/api/v1/dimension/admin/appservices")
export class AdminAppserviceService {

    @GET
    @Path("all")
    public async getAppservices(@QueryParam("scalar_token") scalarToken: string): Promise<AppserviceResponse[]> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);
        return (await AppService.findAll()).map(a => this.mapAppservice(a));
    }

    @GET
    @Path(":appserviceId")
    public async getAppservice(@QueryParam("scalar_token") scalarToken: string, @PathParam("appserviceId") asId: string): Promise<AppserviceResponse> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        try {
            const appservice = await AppserviceStore.getAppservice(asId);
            return this.mapAppservice(appservice);
        } catch (err) {
            LogService.error("AdminAppserviceService", err);
            throw new ApiError(404, "Appservice not found");
        }
    }

    @POST
    @Path("new")
    public async createAppservice(@QueryParam("scalar_token") scalarToken: string, request: AppserviceCreateRequest): Promise<AppserviceResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        // Trim off the @ sign if it's on the prefix
        if (request.userPrefix[0] === "@") {
            request.userPrefix = request.userPrefix.substring(1);
        }

        const appservices = await AppserviceStore.getAllByUserPrefix(request.userPrefix);
        if (appservices && appservices.length > 0) {
            throw new ApiError(400, "User prefix is already in use");
        }

        const appservice = await AppserviceStore.create(AppserviceStore.getSafeUserId(request.userPrefix));
        LogService.info("AdminAppserviceService", userId + " created an application service");
        return this.mapAppservice(appservice);
    }

    @POST
    @Path(":appserviceId/test")
    public async test(@QueryParam("scalar_token") scalarToken: string, @PathParam("appserviceId") asId: string): Promise<any> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const appservice = await AppserviceStore.getAppservice(asId);
        const client = new MatrixAppserviceClient(appservice);
        const userId = await client.whoAmI();

        if (userId.startsWith("@" + appservice.userPrefix)) return {}; // 200 OK
        throw new ApiError(500, "User ID does not match the application service");
    }

    private mapAppservice(as: AppService): AppserviceResponse {
        return {
            id: as.id,
            hsToken: as.hsToken,
            asToken: as.asToken,
            userPrefix: as.userPrefix,
        };
    }
}