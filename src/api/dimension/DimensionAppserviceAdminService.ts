import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import * as Promise from "bluebird";
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
    public getAppservices(@QueryParam("scalar_token") scalarToken: string): Promise<AppserviceResponse[]> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return AppService.findAll();
        }).then(appservices => {
            return appservices.map(this.mapAppservice);
        });
    }

    @POST
    @Path("new")
    public createAppservice(@QueryParam("scalar_token") scalarToken: string, request: AppserviceCreateRequest): Promise<AppserviceResponse> {
        // Trim off the @ sign if it's on the prefix
        if (request.userPrefix[0] === "@") {
            request.userPrefix = request.userPrefix.substring(1);
        }

        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return AppserviceStore.getAllByUserPrefix(request.userPrefix);
        }).then(appservices => {
            if (appservices && appservices.length > 0) {
                throw new ApiError(400, "User prefix is already in use");
            }

            return AppserviceStore.create(AppserviceStore.getSafeUserId(request.userPrefix));
        }).then(this.mapAppservice);
    }

    @GET
    @Path(":appserviceId/users")
    public getUsers(@QueryParam("scalar_token") scalarToken: string, @PathParam("appserviceId") asId: string): Promise<UserResponse[]> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return AppserviceStore.getUsers(asId);
        }).then(users => {
            return users.map(this.mapUser);
        });
    }

    @POST
    @Path(":appserviceId/users/register")
    public registerUser(@QueryParam("scalar_token") scalarToken: string, @PathParam("appserviceId") asId: string, request: NewUserRequest): Promise<UserResponse> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return AppserviceStore.registerUser(asId, request.userId);
        }).then(this.mapUser);
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