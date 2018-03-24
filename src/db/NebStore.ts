import { NebConfig } from "../models/neb";
import NebConfiguration from "./models/NebConfiguration";
import NebIntegration from "./models/NebIntegration";
import Upstream from "./models/Upstream";
import AppService from "./models/AppService";
import { LogService } from "matrix-js-snippets";

export interface SupportedIntegration {
    type: string;
    name: string;
    avatarUrl: string;
    description: string;
}

export class NebStore {

    private static INTEGRATIONS_MODULAR_SUPPORTED = ["giphy", "guggy", "github", "google", "imgur", "rss", "travisci", "wikipedia"];

    private static INTEGRATIONS = {
        "circleci": {
            name: "Circle CI",
            avatarUrl: "/img/avatars/circleci.png",
            description: "Announces build results from Circle CI to the room.",
        },
        "echo": {
            name: "Echo",
            avatarUrl: "/img/avatars/echo.png", // TODO: Make this image
            description: "Repeats text given to it from !echo",
        },
        "giphy": {
            name: "Giphy",
            avatarUrl: "/img/avatars/giphy.png",
            description: "Posts a GIF from Giphy using !giphy <query>",
        },
        "guggy": {
            name: "Guggy",
            avatarUrl: "/img/avatars/guggy.png",
            description: "Send a reaction GIF using !guggy <query>",
        },
        "github": {
            name: "Github",
            avatarUrl: "/img/avatars/github.png",
            description: "Github issue management and announcements for a repository",
        },
        "google": {
            name: "Google",
            avatarUrl: "/img/avatars/google.png",
            description: "Searches Google Images using !google image <query>",
        },
        "imgur": {
            name: "Imgur",
            avatarUrl: "/img/avatars/imgur.png",
            description: "Searches and posts images from Imgur using !imgur <query>",
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
        },
    };

    public static async getAllConfigs(): Promise<NebConfig[]> {
        const configs = await NebConfiguration.findAll();
        return Promise.all((configs || []).map(c => NebStore.getConfig(c.id)));
    }

    public static async getConfig(id: number): Promise<NebConfig> {
        const config = await NebConfiguration.findByPrimary(id);
        if (!config) throw new Error("Configuration not found");

        const integrations = await NebIntegration.findAll({where: {nebId: id}});
        const fullIntegrations = await NebStore.getCompleteIntegrations(config, integrations);

        return new NebConfig(config, fullIntegrations);
    }

    public static async createForUpstream(upstreamId: number): Promise<NebConfig> {
        const upstream = await Upstream.findByPrimary(upstreamId);
        if (!upstream) throw new Error("Upstream not found");

        const config = await NebConfiguration.create({
            upstreamId: upstream.id,
        });

        return NebStore.getConfig(config.id);
    }

    public static async createForAppservice(appserviceId: string, adminUrl: string): Promise<NebConfig> {
        const appservice = await AppService.findByPrimary(appserviceId);
        if (!appservice) throw new Error("Appservice not found");

        const config = await NebConfiguration.create({
            appserviceId: appservice.id,
            adminUrl: adminUrl,
        });

        return NebStore.getConfig(config.id);
    }

    public static async getOrCreateIntegration(configurationId: number, integrationType: string): Promise<NebIntegration> {
        if (!NebStore.INTEGRATIONS[integrationType]) throw new Error("Integration not supported");

        const config = await NebConfiguration.findByPrimary(configurationId);
        if (!config) throw new Error("Configuration not found");

        let integration = await NebIntegration.findOne({where: {nebId: config.id, type: integrationType}});
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

            const config = JSON.parse(JSON.stringify(NebStore.INTEGRATIONS[type]));
            config["type"] = type;
            result.push(config);
        }

        return result;
    }

    private constructor() {
    }
}