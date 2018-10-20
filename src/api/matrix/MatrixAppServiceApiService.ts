import { GET, Path, PathParam, PUT, QueryParam } from "typescript-rest";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-js-snippets";
import { SimplifiedMatrixEvent } from "../../models/MatrixEvent";
import { AppserviceStore } from "../../db/AppserviceStore";

interface AppServiceTransaction {
    events: SimplifiedMatrixEvent[];
}

/**
 * API for handling appservice traffic from a homeserver
 */
@Path("/_matrix/appservice/r0")
@Path("/_matrix/app/v1") // the matrix spec version
export class MatrixAppServiceApiService {

    @PUT
    @Path("/transactions/:txnId")
    public async onTransaction(@QueryParam("access_token") homeserverToken: string, @PathParam("txnId") txnId: string, _txn: AppServiceTransaction): Promise<any> {
        try {
            const appservice = await AppserviceStore.getByHomeserverToken(homeserverToken);

            // We don't handle the transaction at all - we just don't want the homeserver to consider us down
            LogService.verbose("MatrixAppServiceApiService", "Accepting transaction " + txnId + " for appservice " + appservice.id + " blindly");
            return {}; // 200 OK
        } catch (err) {
            LogService.error("MatrixAppServiceApiService", err);
            throw new ApiError(403, {errcode: "M_FORBIDDEN"});
        }
    }

    @GET
    @Path("/room/:alias")
    public async getRoom(@QueryParam("access_token") homeserverToken: string, @PathParam("alias") roomAlias: string): Promise<any> {
        try {
            const appservice = await AppserviceStore.getByHomeserverToken(homeserverToken);

            // We don't support room lookups
            LogService.verbose("MatrixAppServiceApiService", "404ing request for room " + roomAlias + " at appservice " + appservice.id);
            throw new ApiError(404, {errcode: "IO.T2BOT.DIMENSION.ROOMS_NOT_SUPPORTED"});
        } catch (err) {
            if (err instanceof ApiError) throw err;
            LogService.error("MatrixAppServiceApiService", err);
            throw new ApiError(403, {errcode: "M_FORBIDDEN"});
        }
    }

    @GET
    @Path("/user/:userId")
    public async getUser(@QueryParam("access_token") homeserverToken: string, @PathParam("userId") userId: string): Promise<any> {
        try {
            const appservice = await AppserviceStore.getByHomeserverToken(homeserverToken);

            try {
                const user = await AppserviceStore.getUser(appservice.id, userId);
                return {
                    userId: user.id,
                    displayName: user.displayName,
                    avatarUrl: user.avatarUrl,
                }
            } catch (err) {
                LogService.error("MatrixAppServiceApiService", err);
                throw new ApiError(404, {errcode: "IO.T2BOT.DIMENSION.USER_NOT_FOUND"});
            }
        } catch (err) {
            if (err instanceof ApiError) throw err;

            LogService.error("MatrixAppServiceApiService", err);
            throw new ApiError(403, {errcode: "M_FORBIDDEN"});
        }
    }

}