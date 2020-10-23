import { Component } from "@angular/core";
import "../style/app.scss";
import { TranslateService } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: "my-app", // <my-app></my-app>
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent {

    constructor(public translate: TranslateService, public http: HttpClient) {
        translate.addLangs(['en', 'de']);
        translate.setDefaultLang('de');
        if (navigator.language === 'de') {
            translate.use('de');
        } else  {
            translate.use('en');
        }
    }
}
