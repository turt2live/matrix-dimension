import { GET, Path, QueryParam } from "typescript-rest";
import * as Promise from "bluebird";
import { LogService } from "matrix-js-snippets";
import { ApiError } from "../ApiError";
import { MemoryCache } from "../../MemoryCache";
import { MatrixLiteClient } from "../../matrix/MatrixLiteClient";
import config from "../../config";
import { ScalarService } from "./ScalarService";
import moment = require("moment");

interface UrlPreviewResponse {
    cached_response: boolean;
    page_title_cache_item: {
        expires: string; // "2017-12-18T04:20:04.001806738Z"
        cached_response_err: string;
        cached_title: string; // the actual thing riot uses
    };
    error: {
        message: string;
    };
}

@Path("/api/v1/scalar/widgets")
export class ScalarWidgetService {

    private static urlCache = new MemoryCache();

    private static getUrlTitle(url: string): Promise<UrlPreviewResponse> {
        const cachedResult = ScalarWidgetService.urlCache.get(url);
        if (cachedResult) {
            cachedResult.cached_response = true;
            return Promise.resolve(cachedResult);
        }

        const client = new MatrixLiteClient(config.homeserver.name, config.homeserver.accessToken);
        return client.getUrlPreview(url).then(preview => {
            const expirationTime = 60 * 80 * 1000; // 1 hour
            const expirationAsString = moment().add(expirationTime, "milliseconds").toISOString();
            const cachedItem = {
                cached_response: false, // we're not cached yet
                page_title_cache_item: {
                    expires: expirationAsString,
                    cached_response_err: null,
                    cached_title: preview["og:title"],
                },
                error: {message: null},
            };
            ScalarWidgetService.urlCache.put(url, cachedItem, expirationTime);
            return cachedItem;
        }).catch(err => {
            LogService.error("ScalarWidgetService", "Error getting URL preview");
            LogService.error("ScalarWidgetService", err);
            return <UrlPreviewResponse>{
                // All of this is to match scalar's response :/
                cached_response: false,
                page_title_cache_item: {
                    expires: null,
                    cached_response_err: "Failed to get URL preview",
                    cached_title: null
                },
                error: {
                    message: "Failed to get URL preview",
                },
            };
        })
    }

    @GET
    @Path("title_lookup")
    public register(@QueryParam("scalar_token") scalarToken: string, @QueryParam("curl") url: string): Promise<UrlPreviewResponse> {
        return ScalarService.getTokenOwner(scalarToken).then(_userId => {
            return ScalarWidgetService.getUrlTitle(url);
        }, err => {
            if (err !== "Invalid token") {
                LogService.error("ScalarWidgetService", "Error getting account information for user");
                LogService.error("ScalarWidgetService", err);
            }
            throw new ApiError(401, {message: "Invalid token"});
        })
    }
}