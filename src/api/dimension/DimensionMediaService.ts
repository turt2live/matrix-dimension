import { GET, Path, PathParam, QueryParam, Return } from "typescript-rest";
import { MatrixLiteClient } from "../../matrix/MatrixLiteClient";
import config from "../../config";

/**
 * API for interacting with matrix media
 */
@Path("/api/v1/dimension/media")
export class DimensionMediaService {

    @GET
    @Path("thumbnail/:serverName/:contentId")
    public async getThumbnail(@PathParam("serverName") serverName: string, @PathParam("contentId") contentId: string, @QueryParam("width") width: number, @QueryParam("height") height: number, @QueryParam("method") method: "scale" | "crop" = "scale", @QueryParam("animated") isAnimated = true): Promise<any> {
        const client = new MatrixLiteClient(config.homeserver.accessToken);
        const url = await client.getThumbnailUrl(serverName, contentId, width, height, method, isAnimated);
        return new Return.MovedTemporarily(url);
    }
}