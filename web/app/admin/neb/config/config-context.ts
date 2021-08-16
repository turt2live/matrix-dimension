import { FE_NebConfiguration } from "../../../shared/models/admin-responses";
import { FE_Integration } from "../../../shared/models/integration";

export interface NebBotConfigurationDialogContext {
    integration: FE_Integration;
    neb: FE_NebConfiguration;
}