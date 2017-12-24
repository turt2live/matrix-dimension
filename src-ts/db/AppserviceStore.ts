import AppService from "./models/AppService";
import AppServiceUser from "./models/AppServiceUser";
import * as randomString from "random-string";
import * as Promise from "bluebird";
import { MatrixAppserviceClient } from "../matrix/MatrixAppserviceClient";
import { resolveIfExists } from "./DimensionStore";
import config from "../config";

export class AppserviceStore {

    public static create(userPrefix: string): Promise<AppService> {
        const id = "dimension-" + randomString({length: 25});
        const asToken = randomString({length: 100});
        const hsToken = randomString({length: 100});

        return AppService.create({
            id: id,
            asToken: asToken,
            hsToken: hsToken,
            userPrefix: userPrefix,
        });
    }

    public static getUser(appserviceId: string, userId: string): Promise<AppServiceUser> {
        return AppServiceUser.findOne({where: {appserviceId: appserviceId, id: userId}}).then(resolveIfExists);
    }

    public static getByHomeserverToken(hsToken: string): Promise<AppService> {
        return AppService.findOne({where: {hsToken: hsToken}}).then(resolveIfExists);
    }

    public static getAllByUserPrefix(userPrefix: string): Promise<AppService[]> {
        return AppService.findAll({where: {userPrefix: userPrefix}});
    }

    public static getSafeUserId(userIdOrPrefix: string): string {
        // Force user IDs to be lowercase and strip out characters that aren't permitted
        // https://matrix.org/docs/spec/appendices.html#user-identifiers
        return userIdOrPrefix.toLowerCase().replace(/[^a-z0-9._\-=]/g, '.');
    }

    public static getUsers(appserviceId: string): Promise<AppServiceUser[]> {
        return AppServiceUser.findAll({where: {appserviceId: appserviceId}});
    }

    public static registerUser(appserviceId: string, userId: string): Promise<AppServiceUser> {
        userId = AppserviceStore.getSafeUserId(userId);
        return AppService.findOne({where: {id: appserviceId}}).then(resolveIfExists).then(appservice => {
            const client = new MatrixAppserviceClient(config.homeserver.name, appservice);
            const localpart = userId.substring(1).split(":")[0];
            return client.registerUser(localpart);
        }).then(response => {
            return AppServiceUser.create({
                id: userId,
                appserviceId: appserviceId,
                accessToken: response.access_token,
            });
        });
    }

    private constructor() {
    }
}