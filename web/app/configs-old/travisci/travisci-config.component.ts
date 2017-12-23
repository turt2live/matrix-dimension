import { Component } from "@angular/core";
import { TravisCiIntegration } from "../../shared/models/legacyintegration";
import { ModalComponent, DialogRef } from "ngx-modialog";
import { ConfigModalContext } from "../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { ApiService } from "../../shared/services/legacy/api.service";

@Component({
    selector: "my-travisci-config",
    templateUrl: "./travisci-config.component.html",
    styleUrls: ["./travisci-config.component.scss", "./../config.component.scss"],
})
export class TravisCiConfigComponent implements ModalComponent<ConfigModalContext> {

    public integration: TravisCiIntegration;

    public isUpdating = false;
    public repoKey = "";
    public repoTemplate = "";
    public travisYaml = "";

    private roomId: string;
    private scalarToken: string;
    private knownRepos: string[] = [];
    private visibleTemplates = [];

    constructor(public dialog: DialogRef<ConfigModalContext>,
                private toaster: ToasterService,
                private api: ApiService) {
        this.integration = <TravisCiIntegration>dialog.context.integration;
        this.roomId = dialog.context.roomId;
        this.scalarToken = dialog.context.scalarToken;

        this.travisYaml = "notifications:\n    webhooks:\n        urls:\n        - " + this.integration.webhookUrl + "\n    on_success: change # always | never | change\n    on_failure: always\n    on_start: never";

        this.calculateKnownRepos();
        this.reset();
    }

    private calculateKnownRepos() {
        for (let repo of this.integration.repoTemplates)
            this.knownRepos.push(repo.repoKey);
        for (let immutableRepo of this.integration.immutableRepoTemplates)
            this.knownRepos.push(immutableRepo.repoKey);
    }

    public toggleTemplate(repoKey: string) {
        let idx = this.visibleTemplates.indexOf(repoKey);
        if (idx === -1) this.visibleTemplates.push(repoKey);
        else this.visibleTemplates.splice(idx, 1);
    }

    public isTemplateToggled(repoKey: string) {
        return this.visibleTemplates.indexOf(repoKey) !== -1;
    }

    public editTemplate(repoKey: string) {
        this.toggleTemplate(repoKey);
        let repoConfig = this.integration.repoTemplates.find(r => r.repoKey === repoKey);
        repoConfig.newTemplate = repoConfig.template;
    }

    public saveTemplate(repoKey: string) {
        let repoConfig = this.integration.repoTemplates.find(r => r.repoKey === repoKey);
        repoConfig.template = repoConfig.newTemplate;
        this.updateTemplates().then(() => this.toggleTemplate(repoKey));
    }

    public addRepository() {
        if (!this.repoKey || this.repoKey.trim().length === 0) {
            this.toaster.pop("warning", "Please enter a repository");
            return;
        }
        if (this.knownRepos.indexOf(this.repoKey) !== -1) {
            this.toaster.pop("error", "Repository " + this.repoKey + " is already being tracked");
            return;
        }

        this.integration.repoTemplates.push({repoKey: this.repoKey, template: this.repoTemplate, newTemplate: ""});
        this.updateTemplates().then(() => this.reset());
    }

    private reset() {
        this.repoKey = "";
        this.repoTemplate = "%{repository}#%{build_number} (%{branch} - %{commit} : %{author}): %{message}\n    Change view : %{compare_url}\n    Build details : %{build_url}\n";
    }

    public removeRepository(repoKey: string) {
        for (let i = 0; i < this.integration.repoTemplates.length; i++) {
            if (this.integration.repoTemplates[i].repoKey === repoKey) {
                this.integration.repoTemplates.splice(i, 1);
                this.updateTemplates().then(() => this.reset());
                return;
            }
        }

        this.toaster.pop("error", "Could not find target repository");
    }

    public updateTemplates() {
        this.isUpdating = true;
        return this.api.updateIntegrationState(this.roomId, this.integration.type, this.integration.integrationType, this.scalarToken, {
            repoTemplates: this.integration.repoTemplates
        }).then(response => {
            this.integration.repoTemplates = response.repoTemplates;
            this.integration.immutableRepoTemplates = response.immutableRepoTemplates;
            this.calculateKnownRepos();
            this.isUpdating = false;
            this.toaster.pop("success", "Repositories updated");
        }).catch(err => {
            this.toaster.pop("error", err.json().error);
            console.error(err);
            this.isUpdating = false;
        });
    }
}
