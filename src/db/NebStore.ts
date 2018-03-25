import { NebConfig } from "../models/neb";
import NebConfiguration from "./models/NebConfiguration";
import NebIntegration from "./models/NebIntegration";
import Upstream from "./models/Upstream";
import AppService from "./models/AppService";
import { LogService } from "matrix-js-snippets";
import { NebClient } from "../neb/NebClient";
import NebBotUser from "./models/NebBotUser";
import NebNotificationUser from "./models/NebNotificationUser";
import { AppserviceStore } from "./AppserviceStore";
import config from "../config";
import { SimpleBot } from "../integrations/SimpleBot";

export interface SupportedIntegration {
    type: string;
    name: string;
    avatarUrl: string;
    description: string;
}

export class NebStore {

    private static INTEGRATIONS_MODULAR_SUPPORTED = ["giphy", "guggy", "github", "google", "imgur", "rss", "travisci", "wikipedia"];

    private static INTEGRATIONS = {
        // TODO: Support Circle CI
        // "circleci": {
        //     name: "Circle CI",
        //     avatarUrl: "/img/avatars/circleci.png",
        //     description: "Announces build results from Circle CI to the room.",
        // },
        "echo": {
            name: "Echo",
            avatarUrl: "/img/avatars/echo.png", // TODO: Make this image
            description: "Repeats text given to it from !echo",
            simple: true,
        },
        "giphy": {
            name: "Giphy",
            avatarUrl: "/img/avatars/giphy.png",
            description: "Posts a GIF from Giphy using !giphy <query>",
            simple: true,
        },
        "guggy": {
            name: "Guggy",
            avatarUrl: "/img/avatars/guggy.png",
            description: "Send a reaction GIF using !guggy <query>",
            simple: true,
        },
        // TODO: Support Github
        // "github": {
        //     name: "Github",
        //     avatarUrl: "/img/avatars/github.png",
        //     description: "Github issue management and announcements for a repository",
        // },
        "google": {
            name: "Google",
            avatarUrl: "/img/avatars/google.png",
            description: "Searches Google Images using !google image <query>",
            simple: true,
        },
        "imgur": {
            name: "Imgur",
            avatarUrl: "/img/avatars/imgur.png",
            description: "Searches and posts images from Imgur using !imgur <query>",
            simple: true,
        },
        // TODO: Support JIRA
        // "jira": {
        //     name: "Jira",
        //     avatarUrl: "/img/avatars/jira.png",
        //     description: "Jira issue management and announcements for a project",
        // },
        "rss": {
            name: "RSS",
            avatarUrl: "/img/avatars/rssbot.png",
            description: "Announces changes to RSS feeds in the room",
        },
        "travisci": {
            name: "Travis CI",
            avatarUrl: "/img/avatars/travisci.png",
            description: "Announces build results from Travis CI to the room",
        },
        "wikipedia": {
            name: "Wikipedia",
            avatarUrl: "/img/avatars/wikipedia.png",
            description: "Searches wikipedia using !wikipedia <query>",
            simple: true,
        },
    };

    public static async listSimpleBots(): Promise<SimpleBot[]> {
        const configs = await NebStore.getAllConfigs();
        const integrations: { integration: NebIntegration, userId: string }[] = [];
        const hasTypes: string[] = [];

        for (const config of configs) {
            for (const integration of config.dbIntegrations) {
                if (!integration.isEnabled) continue;

                const metadata = NebStore.INTEGRATIONS[integration.type];
                if (!metadata || !metadata.simple) continue;
                if (hasTypes.indexOf(integration.type) !== -1) continue;

                // TODO: Handle case of upstream bots
                const user = await NebStore.getOrCreateBotUser(config.id, integration.type);

                integrations.push({integration: integration, userId: user.appserviceUserId});
                hasTypes.push(integration.type);
            }
        }

        return integrations.map(i => new SimpleBot(i.integration, i.userId));
    }

    public static async getAllConfigs(): Promise<NebConfig[]> {
        const configs = await NebConfiguration.findAll();
        return Promise.all((configs || []).map(c => NebStore.getConfig(c.id)));
    }

    public static async getConfig(id: number): Promise<NebConfig> {
        const nebConfig = await NebConfiguration.findByPrimary(id);
        if (!nebConfig) throw new Error("Configuration not found");

        const integrations = await NebIntegration.findAll({where: {nebId: id}});
        const fullIntegrations = await NebStore.getCompleteIntegrations(nebConfig, integrations);

        return new NebConfig(nebConfig, fullIntegrations);
    }

    public static async createForUpstream(upstreamId: number): Promise<NebConfig> {
        const upstream = await Upstream.findByPrimary(upstreamId);
        if (!upstream) throw new Error("Upstream not found");

        const nebConfig = await NebConfiguration.create({
            upstreamId: upstream.id,
        });

        return NebStore.getConfig(nebConfig.id);
    }

    public static async createForAppservice(appserviceId: string, adminUrl: string): Promise<NebConfig> {
        const appservice = await AppService.findByPrimary(appserviceId);
        if (!appservice) throw new Error("Appservice not found");

        const nebConfig = await NebConfiguration.create({
            appserviceId: appservice.id,
            adminUrl: adminUrl,
        });

        return NebStore.getConfig(nebConfig.id);
    }

    public static async getOrCreateIntegration(configurationId: number, integrationType: string): Promise<NebIntegration> {
        if (!NebStore.INTEGRATIONS[integrationType]) throw new Error("Integration not supported");

        const nebConfig = await NebConfiguration.findByPrimary(configurationId);
        if (!nebConfig) throw new Error("Configuration not found");

        let integration = await NebIntegration.findOne({where: {nebId: nebConfig.id, type: integrationType}});
        if (!integration) {
            LogService.info("NebStore", "Creating integration " + integrationType + " for NEB " + configurationId);
            integration = await NebIntegration.create({
                type: integrationType,
                name: NebStore.INTEGRATIONS[integrationType].name,
                avatarUrl: NebStore.INTEGRATIONS[integrationType].avatarUrl,
                description: NebStore.INTEGRATIONS[integrationType].description,
                isEnabled: false,
                isPublic: true,
                nebId: configurationId,
            });
        }

        return integration;
    }

    public static async getCompleteIntegrations(nebConfig: NebConfiguration, knownIntegrations: NebIntegration[]): Promise<NebIntegration[]> {
        const supported = NebStore.getSupportedIntegrations(nebConfig);
        const notSupported: SupportedIntegration[] = [];
        for (const supportedIntegration of supported) {
            let isSupported = false;
            for (const integration of knownIntegrations) {
                if (integration.type === supportedIntegration.type) {
                    isSupported = true;
                    break;
                }
            }

            if (!isSupported) notSupported.push(supportedIntegration);
        }

        const promises = [];
        for (const missingIntegration of notSupported) {
            promises.push(NebStore.getOrCreateIntegration(nebConfig.id, missingIntegration.type));
        }

        return Promise.all(promises).then(addedIntegrations => (addedIntegrations || []).concat(knownIntegrations));
    }

    public static getSupportedIntegrations(nebConfig: NebConfiguration): SupportedIntegration[] {
        const result = [];

        for (const type of Object.keys(NebStore.INTEGRATIONS)) {
            if (nebConfig.upstreamId && NebStore.INTEGRATIONS_MODULAR_SUPPORTED.indexOf(type) === -1) continue;

            const integrationConfig = JSON.parse(JSON.stringify(NebStore.INTEGRATIONS[type]));
            integrationConfig["type"] = type;
            result.push(integrationConfig);
        }

        return result;
    }

    public static async setIntegrationEnabled(configurationId: number, integrationType: string, isEnabled: boolean): Promise<any> {
        const integration = await this.getOrCreateIntegration(configurationId, integrationType);
        integration.isEnabled = isEnabled;
        await integration.save();

        const neb = await this.getConfig(configurationId);
        if (!neb.appserviceId) return; // Done - nothing to do from here
        const client = new NebClient(neb);

        const botUsers = await NebBotUser.findAll({where: {integrationId: integration.id}});
        for (const user of botUsers) {
            await client.updateUser(user.appserviceUserId, isEnabled, true);
        }

        const notificationUsers = await NebNotificationUser.findAll({where: {integrationId: integration.id}});
        for (const user of notificationUsers) {
            await client.updateUser(user.appserviceUserId, isEnabled, false);
        }
    }

    public static async getOrCreateBotUser(configurationId: number, integrationType: string): Promise<NebBotUser> {
        const neb = await NebStore.getConfig(configurationId);
        if (!neb.appserviceId) throw new Error("Instance not bound to an appservice");

        const integration = await this.getOrCreateIntegration(configurationId, integrationType);
        const users = await NebBotUser.findAll({where: {integrationId: integration.id}});
        if (!users || users.length === 0) {
            const appservice = await AppserviceStore.getAppservice(neb.appserviceId);
            const userId = "@" + appservice.userPrefix + "_" + integrationType + ":" + config.homeserver.name;
            const appserviceUser = await AppserviceStore.getOrCreateUser(neb.appserviceId, userId);

            const client = new NebClient(neb);
            await client.updateUser(userId, integration.isEnabled, true); // creates the user in go-neb

            const serviceId = appservice.id + "_integration_" + integrationType;
            return NebBotUser.create({
                serviceId: serviceId,
                appserviceUserId: appserviceUser.id,
                integrationId: integration.id,
            });
        }

        return users[0];
    }

    public static async setIntegrationConfig(configurationId: number, integrationType: string, newConfig: any): Promise<any> {
        const botUser = await NebStore.getOrCreateBotUser(configurationId, integrationType);
        const neb = await NebStore.getConfig(configurationId);
        const client = new NebClient(neb);

        return client.setServiceConfig(botUser.serviceId, botUser.appserviceUserId, integrationType, newConfig);
    }

    public static async getIntegrationConfig(configurationId: number, integrationType: string): Promise<any> {
        const botUser = await NebStore.getOrCreateBotUser(configurationId, integrationType);
        const neb = await NebStore.getConfig(configurationId);
        const client = new NebClient(neb);

        return client.getServiceConfig(botUser.serviceId);
    }

    private constructor() {
    }
}