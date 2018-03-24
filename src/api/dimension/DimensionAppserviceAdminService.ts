import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { DimensionAdminService } from "./DimensionAdminService";
import AppService from "../../db/models/AppService";
import { AppserviceStore } from "../../db/AppserviceStore";
import { ApiError } from "../ApiError";
import AppServiceUser from "../../db/models/AppServiceUser";

interface AppserviceResponse {
    id: string;
    hsToken: string;
    asToken: string;
    userPrefix: string;
}

interface UserResponse {
    userId: string;
    accessToken: string;
    displayName: string;
    avatarUrl: string;
}

interface NewUserRequest {
    userId: string;
}

interface AppserviceCreateRequest {
    userPrefix: string;
}

@Path("/api/v1/dimension/admin/appservices")
export class DimensionAppserviceAdminService {

    @GET
    @Path("all")
    public async getAppservices(@QueryParam("scalar_token") scalarToken: string): Promise<AppserviceResponse[]> {
        await DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken);
        return (await AppService.findAll()).map(a => this.mapAppservice(a));
    }

    @POST
    @Path("new")
    public async createAppservice(@QueryParam("scalar_token") scalarToken: string, request: AppserviceCreateRequest): Promise<AppserviceResponse> {
        await DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken);

        // Trim off the @ sign if it's on the prefix
        if (request.userPrefix[0] === "@") {
            request.userPrefix = request.userPrefix.substring(1);
        }

        const appservices = await AppserviceStore.getAllByUserPrefix(request.userPrefix);
        if (appservices && appservices.length > 0) {
            throw new ApiError(400, "User prefix is already in use");
        }

        const appservice = await AppserviceStore.create(AppserviceStore.getSafeUserId(request.userPrefix));
        return this.mapAppservice(appservice);
    }

    @GET
    @Path(":appserviceId/users")
    public async getUsers(@QueryParam("scalar_token") scalarToken: string, @PathParam("appserviceId") asId: string): Promise<UserResponse[]> {
        await DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken);
        return (await AppserviceStore.getUsers(asId)).map(u => this.mapUser(u));
    }

    @POST
    @Path(":appserviceId/users/register")
    public async registerUser(@QueryParam("scalar_token") scalarToken: string, @PathParam("appserviceId") asId: string, request: NewUserRequest): Promise<UserResponse> {
        await DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken);

        const user = await AppserviceStore.registerUser(asId, request.userId);
        return this.mapUser(user);
    }

    private mapAppservice(as: AppService): AppserviceResponse {
        return {
            id: as.id,
            hsToken: as.hsToken,
            asToken: as.asToken,
            userPrefix: as.userPrefix,
        };
    }

    private mapUser(user: AppServiceUser): UserResponse {
        return {
            userId: user.id,
            accessToken: user.accessToken,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
        };
    }
}