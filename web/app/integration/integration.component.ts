import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Integration } from "../shared/models/integration";

@Component({
    selector: 'my-integration',
    templateUrl: './integration.component.html',
    styleUrls: ['./integration.component.scss'],
})
export class IntegrationComponent {

    @Input() integration: Integration;
    @Output() updated: EventEmitter<any> = new EventEmitter();

    constructor() {
    }

    public update(): void {
        this.integration.isEnabled = !this.integration.isEnabled;
        this.updated.emit();
    }
}
