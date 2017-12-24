import { GET, Path, PathParam, PUT, QueryParam } from "typescript-rest";
import * as Promise from "bluebird";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-js-snippets";
import { SimplifiedMatrixEvent } from "../../models/MatrixEvent";
import { AppserviceStore } from "../../db/AppserviceStore";

interface AppServiceTransaction {
    events: SimplifiedMatrixEvent[];
}

@Path("/_matrix/appservice/r0")
export class MatrixAppServiceApiService {

    @PUT
    @Path("/transactions/:txnId")
    public onTransaction(@QueryParam("access_token") homeserverToken: string, @PathParam("txnId") txnId: string, _txn: AppServiceTransaction): Promise<any> {
        return AppserviceStore.getByHomeserverToken(homeserverToken).then(appservice => {
            // We don't handle the transaction at all - we just don't want the homeserver to consider us down
            LogService.verbose("MatrixAppServiceApiService", "Accepting transaction " + txnId + " for appservice " + appservice.id + " blindly");
            return {}; // 200 OK
        }, err => {
            LogService.error("MatrixAppServiceApiService", err);
            throw new ApiError(403, {errcode: "M_FORBIDDEN"});
        });
    }

    @GET
    @Path("/room/:alias")
    public getRoom(@QueryParam("access_token") homeserverToken: string, @PathParam("alias") roomAlias: string): Promise<any> {
        return AppserviceStore.getByHomeserverToken(homeserverToken).then(appservice => {
            // We don't support room lookups
            LogService.verbose("MatrixAppServiceApiService", "404ing request for room " + roomAlias + " at appservice " + appservice.id);
            throw new ApiError(404, {errcode: "IO.T2BOT.DIMENSION.ROOMS_NOT_SUPPORTED"});
        }, err => {
            LogService.error("MatrixAppServiceApiService", err);
            throw new ApiError(403, {errcode: "M_FORBIDDEN"});
        });
    }

    @GET
    @Path("/user/:userId")
    public getUser(@QueryParam("access_token") homeserverToken: string, @PathParam("userId") userId: string): Promise<any> {
        return AppserviceStore.getByHomeserverToken(homeserverToken).then(appservice => {
            return AppserviceStore.getUser(appservice.id, userId).catch(err => {
                LogService.error("MatrixAppServiceApiService", err);
                throw new ApiError(404, {errcode: "IO.T2BOT.DIMENSION.USER_NOT_FOUND"});
            });
        }, err => {
            LogService.error("MatrixAppServiceApiService", err);
            throw new ApiError(403, {errcode: "M_FORBIDDEN"});
        }).then(appserviceUser => {
            return {
                userId: appserviceUser.id,
                displayName: appserviceUser.displayName,
                avatarUrl: appserviceUser.avatarUrl,
            };
        });
    }

}