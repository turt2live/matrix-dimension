import { Component } from "@angular/core";
import { IRCIntegration } from "../../shared/models/integration";
import { ModalComponent, DialogRef } from "angular2-modal";
import { ConfigModalContext } from "../../integration/integration.component";

@Component({
    selector: 'my-irc-config',
    templateUrl: './irc-config.component.html',
    styleUrls: ['./irc-config.component.scss', './../config.component.scss'],
})
export class IrcConfigComponent implements ModalComponent<ConfigModalContext> {

    public integration: IRCIntegration;

    private roomId: string;
    private scalarToken: string;

    constructor(public dialog: DialogRef<ConfigModalContext>) {// ,
        // private toaster: ToasterService,
        // private api: ApiService) {
        this.integration = <IRCIntegration>dialog.context.integration;
        this.roomId = dialog.context.roomId;
        this.scalarToken = dialog.context.scalarToken;
    }
}
