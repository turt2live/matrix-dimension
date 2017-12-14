import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Integration } from "../shared/models/integration";
import { overlayConfigFactory } from "ngx-modialog";
import { BSModalContext, Modal } from "ngx-modialog/plugins/bootstrap";
import { IntegrationService } from "../shared/integration.service";

export class ConfigModalContext extends BSModalContext {
    public integration: Integration;
    public roomId: string;
    public userId: string;
    public scalarToken: string;
    public integrationId: string;
}

@Component({
    selector: "my-integration",
    templateUrl: "./integration.component.html",
    styleUrls: ["./integration.component.scss"],
})
export class IntegrationComponent {

    @Input() integration: Integration;
    @Input() roomId: string;
    @Input() scalarToken: string;
    @Output() updated: EventEmitter<any> = new EventEmitter();

    constructor(public modal: Modal) {
    }

    public update(): void {
        this.integration.isEnabled = !this.integration.isEnabled;
        this.updated.emit();
    }

    public configureIntegration(integrationId: string = null): void {
        this.modal.open(IntegrationService.getConfigComponent(this.integration), overlayConfigFactory({
            integration: this.integration,
            roomId: this.roomId,
            scalarToken: this.scalarToken,
            isBlocking: false,
            integrationId: integrationId,
            size: "lg"
        }, BSModalContext));
    }

    public canHaveErrors(integration: Integration): boolean {
        return integration.type === "bridge" || integration.type === "widget";
    }
}
