import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { FE_NebConfiguration } from "../../../shared/models/admin-responses";
import { FE_Integration } from "../../../shared/models/integration";

export class NebBotConfigurationDialogContext extends BSModalContext {
    public integration: FE_Integration;
    public neb: FE_NebConfiguration;
}