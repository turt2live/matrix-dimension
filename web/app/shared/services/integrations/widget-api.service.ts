import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_Widget } from "../../models/integration";
import { IntegrationsApiService } from "./integrations-api.service";
import { HttpClient } from "@angular/common/http";
import { FE_MinimalTerms } from "../../models/terms";

@Injectable()
export class WidgetApiService extends AuthedApi {
    constructor(http: HttpClient, private integrationsApi: IntegrationsApiService) {
        super(http);
    }

    public getWidget(type: string): Promise<FE_Widget> {
        return this.integrationsApi.getIntegration("widget", type).then(i => <FE_Widget>i);
    }

    public isEmbeddable(url: string): Promise<any> { // 200 = success, anything else = error
        return this.http.get("/api/v1/dimension/widgets/embeddable", {params: {url: url}}).toPromise();
    }

    public getTerms(shortcode: string, language: string, version: string): Promise<FE_MinimalTerms> {
        return this.http.get<FE_MinimalTerms>(`/api/v1/dimension/widgets/terms/${shortcode}/${language}/${version}`).toPromise();
    }
}
