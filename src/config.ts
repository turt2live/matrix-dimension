import * as config from "config";
import { LogConfig } from "matrix-js-snippets";

export interface DimensionConfig {
    web: {
        port: number;
        address: string;
    };
    homeserver: {
        name: string;
        accessToken: string;
        clientServerUrl: string;
        federationUrl: string;
        mediaUrl: string;
    };
    widgetBlacklist: string[];
    database: {
        file: string;
        botData: string;
    };
    admins: string[];
    goneb: {
        avatars: {
            [botType: string]: string; // mxc
        };
    };
    telegram: {
        botToken: string;
    };
    stickers: {
        enabled: boolean;
        stickerBot: string;
        managerUrl: string;
    };
    dimension: {
        publicUrl: string;
    };
    logging: LogConfig;
    jitsi: {
        domain: string;
        scriptUrl: string;
        useDomainAsDefault: boolean;
    };
    etherpad: {
        defaultUrl: string;
    };
}

export default <DimensionConfig>config;