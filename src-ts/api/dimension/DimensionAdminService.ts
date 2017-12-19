import { GET, Path, QueryParam } from "typescript-rest";
import * as Promise from "bluebird";
import { ScalarService } from "../scalar/ScalarService";
import config from "../../config";
import { ApiError } from "../ApiError";

interface DimensionInfoResponse {
    admins: string[],
}

@Path("/api/v1/dimension/admin")
export class DimensionAdminService {

    public static isAdmin(userId: string) {
        return config.admins.indexOf(userId) >= 0;
    }

    public static validateAndGetAdminTokenOwner(scalarToken: string): Promise<string> {
        return ScalarService.getTokenOwner(scalarToken).then(userId => {
            if (!DimensionAdminService.isAdmin(userId))
                throw new ApiError(401, {message: "You must be an administrator to use this API"});
            else return userId;
        }, ScalarService.invalidTokenErrorHandler);
    }

    @GET
    @Path("info")
    public getInfo(@QueryParam("scalar_token") scalarToken: string): Promise<DimensionInfoResponse> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            // Only let admins see other admins
            // A 200 OK essentially means "you're an admin".
            return {admins: config.admins};
        });
    }
}