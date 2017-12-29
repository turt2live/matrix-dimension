import { GET, Path, QueryParam } from "typescript-rest";
import * as Promise from "bluebird";
import { ScalarService } from "../scalar/ScalarService";
import config from "../../config";
import { ApiError } from "../ApiError";
import { MatrixLiteClient } from "../../matrix/MatrixLiteClient";
import { CURRENT_VERSION } from "../../version";

interface DimensionVersionResponse {
    version: string;
}

interface DimensionConfigResponse {
    admins: string[];
    widgetBlacklist: string[];
    homeserver: {
        name: string;
        userId: string;
        federationUrl: string;
    };
}

@Path("/api/v1/dimension/admin")
export class DimensionAdminService {

    public static isAdmin(userId: string) {
        return config.admins.indexOf(userId) >= 0;
    }

    public static validateAndGetAdminTokenOwner(scalarToken: string): Promise<string> {
        return ScalarService.getTokenOwner(scalarToken, true).then(userId => {
            if (!DimensionAdminService.isAdmin(userId))
                throw new ApiError(401, {message: "You must be an administrator to use this API"});
            else return userId;
        }, ScalarService.invalidTokenErrorHandler);
    }

    @GET
    @Path("check")
    public checkIfAdmin(@QueryParam("scalar_token") scalarToken: string): Promise<{}> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return {}; // A 200 OK essentially means "you're an admin".
        });
    }

    @GET
    @Path("version")
    public getVersion(@QueryParam("scalar_token") scalarToken: string): Promise<DimensionVersionResponse> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return {version: CURRENT_VERSION};
        });
    }

    @GET
    @Path("config")
    public getConfig(@QueryParam("scalar_token") scalarToken: string): Promise<DimensionConfigResponse> {
        const client = new MatrixLiteClient(config.homeserver.name, config.homeserver.accessToken);
        const response: DimensionConfigResponse = {
            admins: config.admins,
            widgetBlacklist: config.widgetBlacklist,
            homeserver: {
                name: config.homeserver.name,
                userId: "", // populated below
                federationUrl: "", // populated below
            },
        };

        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return client.whoAmI();
        }).then(userId => {
            response.homeserver.userId = userId;
            return client.getFederationUrl();
        }).then(url => {
            response.homeserver.federationUrl = url;
        }).then(() => response);
    }
}