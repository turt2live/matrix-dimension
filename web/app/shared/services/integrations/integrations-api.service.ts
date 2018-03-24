import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_IntegrationsResponse } from "../../models/dimension-responses";
import { FE_Integration, FE_Widget } from "../../models/integration";

@Injectable()
export class IntegrationsApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getIntegrations(roomId: string): Promise<FE_IntegrationsResponse> {
        return this.authedGet("/api/v1/dimension/integrations/room/" + roomId).map(r => r.json()).toPromise();
    }

    public getIntegration(category: string, type: string): Promise<FE_Integration> {
        return this.http.get("/api/v1/dimension/integrations/" + category + "/" + type).map(r => r.json()).toPromise();
    }

    public getWidget(type: string): Promise<FE_Widget> {
        return this.getIntegration("widget", type).then(i => <FE_Widget>i);
    }

    public isEmbeddable(url: string): Promise<any> { // 200 = success, anything else = error
        return this.http.get("/api/v1/dimension/widgets/embeddable", {params: {url: url}})
            .map(r => r.json()).toPromise();
    }
}
