import { GET, Path, QueryParam } from "typescript-rest";
import { LogService } from "matrix-js-snippets";
import { Cache, CACHE_WIDGET_TITLES } from "../../MemoryCache";
import { MatrixLiteClient } from "../../matrix/MatrixLiteClient";
import config from "../../config";
import moment = require("moment");
import { AutoWired, Inject } from "typescript-ioc/es6";
import AccountController from "../controllers/AccountController";

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

/**
 * API for the minimum Scalar API for widget functionality in clients.
 */
@Path("/api/v1/scalar/widgets")
@AutoWired
export class ScalarWidgetService {

    @Inject
    private accountController: AccountController;

    @GET
    @Path("title_lookup")
    public async titleLookup(@QueryParam("scalar_token") scalarToken: string, @QueryParam("curl") url: string): Promise<UrlPreviewResponse> {
        await this.accountController.getTokenOwner(scalarToken);

        const cachedResult = Cache.for(CACHE_WIDGET_TITLES).get(url);
        if (cachedResult) {
            cachedResult.cached_response = true;
            return cachedResult;
        }

        const client = new MatrixLiteClient(config.homeserver.accessToken);

        try {
            const preview = await client.getUrlPreview(url);
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
            Cache.for(CACHE_WIDGET_TITLES).put(url, cachedItem, expirationTime);
            return cachedItem;
        } catch (err) {
            LogService.error("ScalarWidgetService", "Error getting URL preview");
            LogService.error("ScalarWidgetService", err);
            return <UrlPreviewResponse>{
                // All of this is to match scalar's response :/
                cached_response: false,
                page_title_cache_item: {
                    expires: null,
                    cached_response_err: "Failed to get URL preview",
                    cached_title: null,
                },
                error: {
                    message: "Failed to get URL preview",
                },
            };
        }
    }
}