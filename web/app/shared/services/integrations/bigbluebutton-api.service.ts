import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_BigBlueButtonJoin } from "../../models/integration"
import { HttpClient } from "@angular/common/http";
import { ApiError } from "../../../../../src/api/ApiError";

@Injectable()
export class BigBlueButtonApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public joinMeeting(url: string, name: string): Promise<FE_BigBlueButtonJoin|ApiError> {
        return this.authedGet<FE_BigBlueButtonJoin|ApiError>("/api/v1/dimension/bigbluebutton/join", {greenlightUrl: url, fullName: name}).toPromise();
    }
}