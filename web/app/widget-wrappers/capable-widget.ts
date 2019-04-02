import { OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { ScalarWidgetApi } from "../shared/services/scalar/scalar-widget.api";
import * as semver from "semver";
import { FE_ScalarOpenIdRequestBody } from "../shared/models/scalar-server-responses";

export const WIDGET_API_VERSION_BASIC = "0.0.1";
export const WIDGET_API_VERSION_OPENID = "0.0.2";

export const WIDGET_API_DIMENSION_VERSIONS = [WIDGET_API_VERSION_BASIC, WIDGET_API_VERSION_OPENID];

export interface OpenIdResponse {
    openId: FE_ScalarOpenIdRequestBody;
    blocked: boolean;
}

export abstract class CapableWidget implements OnInit, OnDestroy {

    private requestSubscription: Subscription;
    private responseSubscription: Subscription;
    private openIdRequest: { resolve: (a: OpenIdResponse) => void, promise: Promise<OpenIdResponse> } = null;

    // The capabilities we support
    protected supportsScreenshots = false;
    protected supportsStickers = false;
    protected supportsAlwaysOnScreen = false;

    // Stuff about the client
    protected clientWidgetApiVersions = [];

    public ngOnInit() {
        this.requestSubscription = ScalarWidgetApi.requestReceived.subscribe(request => {
            if (request.action === "capabilities") {
                const capabilities = [];

                if (this.supportsScreenshots) capabilities.push("m.capability.screenshot");
                if (this.supportsStickers) capabilities.push("m.sticker");
                if (this.supportsAlwaysOnScreen) capabilities.push("m.always_on_screen");

                ScalarWidgetApi.replyCapabilities(request, capabilities);
                this.onCapabilitiesSent();
            } else if (request.action === "supported_api_versions") {
                ScalarWidgetApi.replySupportedVersions(request, WIDGET_API_DIMENSION_VERSIONS);
            } else if (request.action === "openid_credentials" && this.openIdRequest) {
                if (request.data.success) {
                    this.openIdRequest.resolve({openId: request.data, blocked: false});
                } else {
                    this.openIdRequest.resolve({openId: null, blocked: true});
                }
                this.openIdRequest = null;
                ScalarWidgetApi.replyAcknowledge(request);
            }
        });
        this.responseSubscription = ScalarWidgetApi.replyReceived.subscribe(request => {
            if (!request.response) return;

            if (request.action === "supported_api_versions") {
                this.clientWidgetApiVersions = request.response.supported_versions || [];
                this.onSupportedVersionsFound();
            } else if (request.action === "get_openid" && this.openIdRequest) {
                if (request.response.state === "allowed") {
                    this.openIdRequest.resolve({openId: request.response, blocked: false});
                    this.openIdRequest = null;
                } else if (request.response.state === "blocked") {
                    this.openIdRequest.resolve({openId: null, blocked: true});
                    this.openIdRequest = null;
                }
            }
        });
    }

    public ngOnDestroy() {
        if (this.requestSubscription) this.requestSubscription.unsubscribe();
        if (this.responseSubscription) this.responseSubscription.unsubscribe();
    }

    protected onCapabilitiesSent(): void {
        ScalarWidgetApi.requestSupportedVersions();
    }

    protected onSupportedVersionsFound(): void {
        // Nothing to do here.
    }

    protected doesSupportAtLeastVersion(apiVersion: string): boolean {
        for (const version of this.clientWidgetApiVersions) {
            if (semver.satisfies(semver.clean(version), `>=${apiVersion}`)) {
                return true;
            }
        }
        return false;
    }

    protected getOpenIdInfo(): Promise<OpenIdResponse> {
        if (this.openIdRequest) return this.openIdRequest.promise;
        const promise = new Promise<OpenIdResponse>(((resolve, _reject) => {
            this.openIdRequest = {resolve: resolve, promise};
            ScalarWidgetApi.requestOpenID();
        }));
        return promise;
    }
}