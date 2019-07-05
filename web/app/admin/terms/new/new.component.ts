import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { AdminTermsApiService } from "../../../shared/services/admin/admin-terms-api.service";
import { ActivatedRoute, Router } from "@angular/router";
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import ISO6391 from "iso-639-1";

interface ILanguage {
    name: string,
    text: string,
    langName: string,
    url: string,
    isExternal: boolean,
    externalUrl: string,
}

@Component({
    templateUrl: "./new.component.html",
    styleUrls: ["./new.component.scss"],
})
export class AdminNewTermsComponent implements OnInit {

    // TODO: Multiple language support
    // TODO: Support external URLs

    public Editor = ClassicEditor;

    public isLoading = true;
    public isUpdating = false;
    public takenShortcodes: string[];
    public chosenLanguage: string = ISO6391.getAllCodes()[0];
    public languages: {
        [languageCode: string]: ILanguage;
    } = {
        "en": {
            name: "",
            text: "",
            langName: "English",
            url: "", // TODO: Calculate
            isExternal: false,
            externalUrl: "",
        },
    };

    public get chosenLanguageCodes(): string[] {
        return Object.keys(this.languages);
    }

    public get availableLanguages(): { name: string, code: string }[] {
        return ISO6391.getAllCodes()
            .filter(c => !this.chosenLanguageCodes.includes(c))
            .map(c => {
                return {code: c, name: ISO6391.getName(c)};
            });
    }

    constructor(private adminTerms: AdminTermsApiService,
                private toaster: ToasterService,
                private router: Router,
                private activatedRoute: ActivatedRoute) {
    }

    public ngOnInit() {
        this.adminTerms.getAllPolicies().then(policies => {
            this.takenShortcodes = policies.map(p => p.shortcode);
            this.isLoading = false;
        }).catch(err => {
            console.error(err);
            this.toaster.pop("error", "Failed to load policies");
        });
    }

    public async create() {
        for (const languageCode in this.languages) {
            if (this.languages[languageCode].name.trim().length <= 0) {
                this.toaster.pop("warning", "Please enter a name for all policies");
                return;
            }
            if (this.languages[languageCode].text.trim().length <= 0) {
                this.toaster.pop("warning", "Please enter text for all policies");
                return;
            }
        }

        this.isUpdating = true;

        const startShortcode = this.languages['en'].name.toLowerCase().replace(/[^a-z0-9]/gi, '_');
        let shortcode = startShortcode;
        let i = 0;
        while (this.takenShortcodes.includes(shortcode)) {
            shortcode = `${startShortcode}_${++i}`;
        }

        try {
            await this.adminTerms.createDraft(shortcode, {
                name: this.languages['en'].name,
                text: this.languages['en'].text,
                url: `${window.location.origin}/terms/${shortcode}/en/draft`,
            });

            this.toaster.pop("success", "Draft created");
            this.router.navigate([".."], {relativeTo: this.activatedRoute});
        } catch (e) {
            console.error(e);
            this.toaster.pop("error", "Error creating document");
            this.isUpdating = false;
        }
    }

    public addLanguage() {
        this.languages[this.chosenLanguage] = {
            name: "",
            text: "",
            url: "", // TODO: Calculate
            isExternal: false,
            externalUrl: "",
            langName: ISO6391.getName(this.chosenLanguage),
        };
        this.chosenLanguage = this.availableLanguages[0].code;
    }

}
