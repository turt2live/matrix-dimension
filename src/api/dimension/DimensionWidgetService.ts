import { GET, Path, PathParam, QueryParam } from "typescript-rest";
import { LogService } from "matrix-js-snippets";
import * as url from "url";
import { promises as dnsPromises } from 'dns';
import { ApiError } from "../ApiError";
import config from "../../config";
import { Netmask } from "netmask";
import * as request from "request";
import { VERSION_DRAFT } from "../controllers/TermsController";
import TermsRecord from "../../db/models/TermsRecord";
import TermsTextRecord from "../../db/models/TermsTextRecord";

interface EmbedCapabilityResponse {
    canEmbed: boolean;
}

interface MinimalTermsResponse {
    name: string;
    text: string;
}

/**
 * API for widgets
 */
@Path("/api/v1/dimension/widgets")
export class DimensionWidgetService {

    @GET
    @Path("/terms/:shortcode/:language/:version")
    public async getPolicy(@PathParam("shortcode") shortcode: string, @PathParam("language") language: string, @PathParam("version") version: string): Promise<MinimalTermsResponse> {
        if (version === VERSION_DRAFT) {
            throw new ApiError(401, "Cannot access draft versions of policies", "M_UNAUTHORIZED");
        }

        const terms = await TermsRecord.findOne({where: {shortcode, version}, include: [TermsTextRecord]});
        if (!terms) throw new ApiError(404, "Not found", "M_NOT_FOUND");

        const text = terms.texts.find(t => t.language === language);

        return {
            name: text.name,
            text: text.text,
        };
    }

    @GET
    @Path("embeddable")
    public async isEmbeddable(@QueryParam("url") checkUrl: string): Promise<EmbedCapabilityResponse> {
        LogService.info("DimensionWidgetService", "Checking to see if a url is embeddable: " + checkUrl);

        const parsed = url.parse(checkUrl);

        // Only allow http and https
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            throw new ApiError(400, "Invalid scheme: " + parsed.protocol);
        }

        // Get the IP address we're trying to connect to so we can ensure it's not blacklisted
        const hostname = parsed.hostname.split(":")[0];
        let addresses = [];
        try {
            addresses = await dnsPromises.resolve(hostname);
        } catch (err) {
            LogService.error("DimensionWidgetService", err);
        }
        if (!addresses || addresses.length === 0) throw new ApiError(400, "Cannot resolve host " + hostname);

        // Check the blacklist
        for (const ipOrCidr of config.widgetBlacklist) {
            const block = new Netmask(ipOrCidr);
            for (const address of addresses) {
                if (block.contains(address)) {
                    throw new ApiError(400, "Address blacklisted");
                }
            }
        }

        // Now we need to verify we can actually make the request
        await new Promise<ApiError | void>((resolve, reject) => {
            request(checkUrl, (err, response) => {
                if (err) {
                    LogService.error("DimensionWidgetService", err);
                    return reject(new ApiError(400, "Failed to contact host"));
                }

                if (response.statusCode >= 200 && response.statusCode < 300) {
                    // 200 OK
                    const xFrameOptions = (response.headers["x-frame-options"] || '').toLowerCase();

                    if (xFrameOptions === "sameorigin" || xFrameOptions === "deny") {
                        return reject(new ApiError(400, "X-Frame-Options prevents embedding"));
                    }

                    resolve();
                } else {
                    LogService.verbose("DimensionWidgetService", response.body);
                    return reject(new ApiError(400, "Non-success status code returned"));
                }
            });
        });

        return {canEmbed: true};
    }
}