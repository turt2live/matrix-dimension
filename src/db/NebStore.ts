import * as Promise from "bluebird";
import { resolveIfExists } from "./DimensionStore";
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

    public static getAllConfigs(): Promise<NebConfig[]> {
        return NebConfiguration.findAll().then(configs => {
            return Promise.all((configs || []).map(c => NebStore.getConfig(c.id)));
        });
    }

    public static getConfig(id: number): Promise<NebConfig> {
        let nebConfig: NebConfiguration;
        return NebConfiguration.findByPrimary(id).then(resolveIfExists).then(conf => {
            nebConfig = conf;
            return NebIntegration.findAll({where: {nebId: id}});
        }).then(integrations => {
            return NebStore.getCompleteIntegrations(nebConfig, integrations);
        }).then(integrations => {
            return new NebConfig(nebConfig, integrations);
        });
    }

    public static createForUpstream(upstreamId: number): Promise<NebConfig> {
        return Upstream.findByPrimary(upstreamId).then(resolveIfExists).then(upstream => {
            return NebConfiguration.create({
                upstreamId: upstream.id,
            });
        }).then(config => {
            return NebStore.getConfig(config.id);
        });
    }

    public static createForAppservice(appserviceId: string, adminUrl: string): Promise<NebConfig> {
        return AppService.findByPrimary(appserviceId).then(resolveIfExists).then(appservice => {
            return NebConfiguration.create({
                appserviceId: appservice.id,
                adminUrl: adminUrl,
            });
        }).then(config => {
            return NebStore.getConfig(config.id);
        });
    }

    public static getOrCreateIntegration(configurationId: number, integrationType: string): Promise<NebIntegration> {
        if (!NebStore.INTEGRATIONS[integrationType]) return Promise.reject(new Error("Integration not supported"));

        return NebConfiguration.findByPrimary(configurationId).then(resolveIfExists).then(config => {
            return NebIntegration.findOne({where: {nebId: config.id, type: integrationType}});
        }).then(integration => {
            if (!integration) {
                LogService.info("NebStore", "Creating integration " + integrationType + " for NEB " + configurationId);
                return NebIntegration.create({
                    type: integrationType,
                    name: NebStore.INTEGRATIONS[integrationType].name,
                    avatarUrl: NebStore.INTEGRATIONS[integrationType].avatarUrl,
                    description: NebStore.INTEGRATIONS[integrationType].description,
                    isEnabled: false,
                    isPublic: true,
                    nebId: configurationId,
                });
            } else return Promise.resolve(integration);
        });
    }

    public static getCompleteIntegrations(nebConfig: NebConfiguration, knownIntegrations: NebIntegration[]): Promise<NebIntegration[]> {
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