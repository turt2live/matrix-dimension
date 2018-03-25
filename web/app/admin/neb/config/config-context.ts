import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { FE_Integration } from "../../../shared/models/integration";
import { FE_NebConfiguration } from "../../../shared/models/admin-responses";

export class NebBotConfigurationDialogContext extends BSModalContext {
    public integration: FE_Integration;
    public neb: FE_NebConfiguration;
}