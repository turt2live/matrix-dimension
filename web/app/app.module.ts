import { ApplicationRef, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpModule } from "@angular/http";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { routing } from "./app.routing";
import { createNewHosts, removeNgStyles } from "@angularclass/hmr";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { RiotComponent } from "./riot/riot.component";
import { ApiService } from "./shared/services/api.service";
import { UiSwitchModule } from "angular2-ui-switch";
import { ScalarService } from "./shared/services/scalar.service";
import { ToasterModule } from "angular2-toaster";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ScalarCloseComponent } from "./riot/scalar-close/scalar-close.component";
import { IntegrationService } from "./shared/services/integration.service";
import { BootstrapModalModule } from "ngx-modialog/plugins/bootstrap";
import { ModalModule } from "ngx-modialog";
import { IrcApiService } from "./shared/services/irc-api.service";
import { GenericWidgetWrapperComponent } from "./widget_wrappers/generic/generic.component";
import { ToggleFullscreenDirective } from "./shared/directives/toggle-fullscreen.directive";
import { FullscreenButtonComponent } from "./fullscreen-button/fullscreen-button.component";
import { VideoWidgetWrapperComponent } from "./widget_wrappers/video/video.component";
import { JitsiWidgetWrapperComponent } from "./widget_wrappers/jitsi/jitsi.component";
import { GCalWidgetWrapperComponent } from "./widget_wrappers/gcal/gcal.component";
import { PageHeaderComponent } from "./page-header/page-header.component";
import { SpinnerComponent } from "./spinner/spinner.component";
import { BreadcrumbsModule } from "ng2-breadcrumbs";
import { RiotHomeComponent } from "./riot/riot-home/home.component";
import { IntegrationBagComponent } from "./integration-bag/integration-bag.component";
import { IntegrationComponent } from "./integration/integration.component";

const WIDGET_CONFIGURATION_COMPONENTS: any[] = IntegrationService.getAllConfigComponents();

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
        BreadcrumbsModule,
    ],
    declarations: [
        ...WIDGET_CONFIGURATION_COMPONENTS,
        AppComponent,
        HomeComponent,
        RiotComponent,
        IntegrationComponent,
        IntegrationBagComponent,
        PageHeaderComponent,
        SpinnerComponent,
        ScalarCloseComponent,
        GenericWidgetWrapperComponent,
        ToggleFullscreenDirective,
        FullscreenButtonComponent,
        VideoWidgetWrapperComponent,
        JitsiWidgetWrapperComponent,
        GCalWidgetWrapperComponent,
        RiotHomeComponent,

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
        ...WIDGET_CONFIGURATION_COMPONENTS,
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
