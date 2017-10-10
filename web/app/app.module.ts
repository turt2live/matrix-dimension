import { NgModule, ApplicationRef } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpModule } from "@angular/http";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { routing } from "./app.routing";
import { removeNgStyles, createNewHosts } from "@angularclass/hmr";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { RiotComponent } from "./riot/riot.component";
import { ApiService } from "./shared/api.service";
import { UiSwitchModule } from "angular2-ui-switch";
import { ScalarService } from "./shared/scalar.service";
import { ToasterModule } from "angular2-toaster";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { IntegrationComponent } from "./integration/integration.component";
import { ScalarCloseComponent } from "./riot/scalar-close/scalar-close.component";
import { IntegrationService } from "./shared/integration.service";
import { BootstrapModalModule } from "ngx-modialog/plugins/bootstrap";
import { ModalModule } from "ngx-modialog";
import { RssConfigComponent } from "./configs/rss/rss-config.component";
import { IrcConfigComponent } from "./configs/irc/irc-config.component";
import { IrcApiService } from "./shared/irc-api.service";
import { TravisCiConfigComponent } from "./configs/travisci/travisci-config.component";
import { CustomWidgetConfigComponent } from "./configs/widget/custom_widget/custom_widget-config.component";
import { MyFilterPipe } from "./shared/my-filter.pipe";
import { GenericWidgetWrapperComponent } from "./widget_wrappers/generic/generic.component";
import { ToggleFullscreenDirective } from "./toggle-fullscreen/toggle-fullscreen.directive";
import { FullscreenButtonComponent } from "./fullscreen-button/fullscreen-button.component";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        routing,
        NgbModule.forRoot(),
        UiSwitchModule,
        ToasterModule,
        BrowserAnimationsModule,
        ModalModule.forRoot(),
        BootstrapModalModule,
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        RiotComponent,
        IntegrationComponent,
        ScalarCloseComponent,
        RssConfigComponent,
        IrcConfigComponent,
        TravisCiConfigComponent,
        CustomWidgetConfigComponent,
        MyFilterPipe,
        GenericWidgetWrapperComponent,
        ToggleFullscreenDirective,
        FullscreenButtonComponent,

        // Vendor
    ],
    providers: [
        ApiService,
        ScalarService,
        IntegrationService,
        IrcApiService,
        {provide: Window, useValue: window},

        // Vendor
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        RssConfigComponent,
        TravisCiConfigComponent,
        IrcConfigComponent,
        CustomWidgetConfigComponent,
    ]
})
export class AppModule {
    constructor(public appRef: ApplicationRef) {
    }

    hmrOnInit(store) {
        console.log("HMR store", store);
    }

    hmrOnDestroy(store) {
        let cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
        // recreate elements
        store.disposeOldHosts = createNewHosts(cmpLocation);
        // remove styles
        removeNgStyles();
    }

    hmrAfterDestroy(store) {
        // display new elements
        store.disposeOldHosts();
        delete store.disposeOldHosts;
    }
}
