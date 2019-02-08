import { GET, Path, QueryParam } from "typescript-rest";
import { ScalarService } from "../scalar/ScalarService";
import config from "../../config";
import { ApiError } from "../ApiError";
import { MatrixLiteClient } from "../../matrix/MatrixLiteClient";
import { CURRENT_VERSION } from "../../version";
import { getFederationConnInfo } from "../../matrix/helpers";

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
        federationHostname: string;
        clientServerUrl: string;
    };
}

/**
 * Administrative API for general information about Dimension
 */
@Path("/api/v1/dimension/admin")
export class AdminService {

    /**
     * Determines if a given user is an administrator
     * @param {string} userId The user ID to validate
     * @returns {boolean} True if the user is an administrator
     */
    public static isAdmin(userId: string) {
        return config.admins.indexOf(userId) >= 0;
    }

    /**
     * Validates the given scalar token to ensure the owner is an administrator. If the
     * given scalar token does not belong to an administrator, an ApiError is raised.
     * @param {string} scalarToken The scalar token to validate
     * @returns {Promise<string>} Resolves to the owner's user ID if they are an administrator
     * @throws {ApiError} Thrown with a status code of 401 if the owner is not an administrator
     */
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
        const fedInfo = await getFederationConnInfo(config.homeserver.name);
        return {
            admins: config.admins,
            widgetBlacklist: config.widgetBlacklist,
            homeserver: {
                name: config.homeserver.name,
                userId: await client.whoAmI(),
                federationUrl: fedInfo.url,
                federationHostname: fedInfo.hostname,
                clientServerUrl: config.homeserver.clientServerUrl,
            },
        };
    }

    @GET
    @Path("test/federation")
    public async testFederationRouting(@QueryParam("scalar_token") scalarToken: string, @QueryParam("server_name") serverName: string): Promise<any> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        return {
            inputServerName: serverName,
            resolvedServer: await getFederationConnInfo(serverName),
        };
    }
}