import { GET, Path } from "typescript-rest";
import { URL } from "url";
import config from "../../config";

interface WellknownResponse {
    "m.integrations_widget": {
        url: string;
        data: {
            api_url: string;
        };
    };
}

/**
 * Serving of the .well-known file
 */
@Path("/.well-known/matrix")
export class MatrixWellknownService {

    @GET
    @Path("integrations")
    public async getIntegrations(): Promise<WellknownResponse> {
        const parsed = new URL(config.dimension.publicUrl);

        parsed.pathname = '/element';
        const uiUrl = parsed.toString();

        parsed.pathname = '/api/v1/scalar';
        const apiUrl = parsed.toString();

        return {
            "m.integrations_widget": {
                url: uiUrl,
                data: {
                    api_url: apiUrl,
                },
            },
        };
    }
}
