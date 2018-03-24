import { GET, Path, QueryParam } from "typescript-rest";
import { ScalarService } from "../scalar/ScalarService";
import config from "../../config";
import { ApiError } from "../ApiError";
import { MatrixLiteClient } from "../../matrix/MatrixLiteClient";
import { CURRENT_VERSION } from "../../version";
import { getFederationUrl } from "../../matrix/helpers";

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
        clientServerUrl: string;
    };
}

@Path("/api/v1/dimension/admin")
export class AdminService {

    public static isAdmin(userId: string) {
        return config.admins.indexOf(userId) >= 0;
    }

    public static async validateAndGetAdminTokenOwner(scalarToken: string): Promise<string> {
        const userId = await ScalarService.getTokenOwner(scalarToken, true);
        if (!AdminService.isAdmin(userId))
            throw new ApiError(401, "You must be an administrator to use this API");
        return userId;
    }

    @GET
    @Path("check")
    public async checkIfAdmin(@QueryParam("scalar_token") scalarToken: string): Promise<{}> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);
        return {}; // A 200 OK essentially means "you're an admin".
    }

    @GET
    @Path("version")
    public async getVersion(@QueryParam("scalar_token") scalarToken: string): Promise<DimensionVersionResponse> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);
        return {version: CURRENT_VERSION};
    }

    @GET
    @Path("config")
    public async getConfig(@QueryParam("scalar_token") scalarToken: string): Promise<DimensionConfigResponse> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const client = new MatrixLiteClient(config.homeserver.accessToken);
        return {
            admins: config.admins,
            widgetBlacklist: config.widgetBlacklist,
            homeserver: {
                name: config.homeserver.name,
                userId: await client.whoAmI(),
                federationUrl: await getFederationUrl(config.homeserver.name),
                clientServerUrl: config.homeserver.clientServerUrl,
            },
        };
    }
}