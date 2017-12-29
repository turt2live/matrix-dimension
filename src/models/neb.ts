import NebConfiguration from "../db/models/NebConfiguration";
import { Integration } from "../integrations/Integration";
import NebIntegration from "../db/models/NebIntegration";

export class NebConfig {
    public id: number;
    public adminUrl?: string;
    public appserviceId?: string;
    public upstreamId?: number;
    public integrations: Integration[];

    public constructor(config: NebConfiguration, integrations: NebIntegration[]) {
        this.id = config.id;
        this.adminUrl = config.adminUrl;
        this.appserviceId = config.appserviceId;
        this.upstreamId = config.upstreamId;
        this.integrations = integrations.map(i => new Integration(i));
    }
}