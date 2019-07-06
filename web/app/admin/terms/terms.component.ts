import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { FE_TermsEditable } from "../../shared/models/terms";
import { AdminTermsApiService } from "../../shared/services/admin/admin-terms-api.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    templateUrl: "./terms.component.html",
    styleUrls: ["./terms.component.scss"],
})
export class AdminTermsComponent implements OnInit {

    // TODO: "New draft" per policy button
    // TODO: Delete button

    public isLoading = true;
    public policies: FE_TermsEditable[];

    constructor(private adminTerms: AdminTermsApiService,
                private toaster: ToasterService,
                private router: Router,
                private activatedRoute: ActivatedRoute) {
    }

    public ngOnInit() {
        this.adminTerms.getAllPolicies().then(policies => {
            this.policies = [
                ...policies.filter(p => p.version === "draft"),
                ...policies.filter(p => p.version !== "draft"),
            ];
            this.isLoading = false;
        }).catch(err => {
            console.error(err);
            this.toaster.pop("error", "Failed to load policies");
        });
    }

    public createPolicy() {
        this.router.navigate(["new"], {relativeTo: this.activatedRoute});
    }

}
