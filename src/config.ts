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
    };
    widgetBlacklist: string[];
    database: {
        file: string;
    };
    admins: string[];
    logging: LogConfig;
}

export default <DimensionConfig>config;