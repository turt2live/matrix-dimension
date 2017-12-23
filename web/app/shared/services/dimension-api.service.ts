import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "./AuthedApi";
import { DimensionIntegrationsResponse } from "../models/dimension_responses";
import { Widget } from "../models/integration";

@Injectable()
export class DimensionApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getIntegrations(roomId: string): Promise<DimensionIntegrationsResponse> {
        return this.authedGet("/api/v1/dimension/integrations/room/" + roomId).map(r => r.json()).toPromise();
    }

    public getWidget(type: string): Promise<Widget> {
        return this.http.get("/api/v1/dimension/integrations/widget/" + type).map(r => r.json()).toPromise();
    }

    public isEmbeddable(url: string): Promise<any> { // 200 = success, anything else = error
        return this.http.get("/api/v1/dimension/widgets/embeddable", {params: {url: url}})
            .map(r => r.json()).toPromise();
    }
}
