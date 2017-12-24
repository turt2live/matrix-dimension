import { ApplicationRef, Injector, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpModule } from "@angular/http";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { routing } from "./app.routing";
import { createNewHosts, removeNgStyles } from "@angularclass/hmr";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { RiotComponent } from "./riot/riot.component";
import { UiSwitchModule } from "angular2-ui-switch";
import { ScalarClientApiService } from "./shared/services/scalar-client-api.service";
import { ToasterModule } from "angular2-toaster";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ScalarCloseComponent } from "./riot/scalar-close/scalar-close.component";
import { BootstrapModalModule } from "ngx-modialog/plugins/bootstrap";
import { ModalModule } from "ngx-modialog";
import { GenericWidgetWrapperComponent } from "./widget_wrappers/generic/generic.component";
import { ToggleFullscreenDirective } from "./shared/directives/toggle-fullscreen.directive";
import { FullscreenButtonComponent } from "./elements/fullscreen-button/fullscreen-button.component";
import { VideoWidgetWrapperComponent } from "./widget_wrappers/video/video.component";
import { JitsiWidgetWrapperComponent } from "./widget_wrappers/jitsi/jitsi.component";
import { GCalWidgetWrapperComponent } from "./widget_wrappers/gcal/gcal.component";
import { PageHeaderComponent } from "./page-header/page-header.component";
import { SpinnerComponent } from "./elements/spinner/spinner.component";
import { BreadcrumbsModule } from "ng2-breadcrumbs";
import { RiotHomeComponent } from "./riot/riot-home/home.component";
import { IntegrationBagComponent } from "./integration-bag/integration-bag.component";
import { ScalarServerApiService } from "./shared/services/scalar-server-api.service";
import { DimensionApiService } from "./shared/services/dimension-api.service";
import { AdminApiService } from "./shared/services/admin-api.service";
import { ServiceLocator } from "./shared/services/locator.service";
import { IboxComponent } from "./elements/ibox/ibox.component";
import { CustomWidgetConfigComponent } from "./configs/widget/custom/custom.widget.component";
import { ConfigScreenWidgetComponent } from "./configs/widget/config_screen/config_screen.widget.component";
import { EtherpadWidgetConfigComponent } from "./configs/widget/etherpad/etherpad.widget.component";
import { NameService } from "./shared/services/name.service";
import { GoogleCalendarWidgetConfigComponent } from "./configs/widget/google_calendar/gcal.widget.component";
import { GoogleDocsWidgetConfigComponent } from "./configs/widget/google_docs/gdoc.widget.component";
import { JitsiWidgetConfigComponent } from "./configs/widget/jitsi/jitsi.widget.component";
import { TwitchWidgetConfigComponent } from "./configs/widget/twitch/twitch.widget.component";
import { YoutubeWidgetConfigComponent } from "./configs/widget/youtube/youtube.widget.component";
import { AdminComponent } from "./admin/admin.component";
import { AdminHomeComponent } from "./admin/home/home.component";
import { AdminWidgetsComponent } from "./admin/widgets/widgets.component";
import { AdminWidgetEtherpadConfigComponent } from "./admin/widgets/etherpad/etherpad.component";
import { AdminWidgetJitsiConfigComponent } from "./admin/widgets/jitsi/jitsi.component";

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
        AppComponent,
        HomeComponent,
        RiotComponent,
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
        IboxComponent,
        ConfigScreenWidgetComponent,
        CustomWidgetConfigComponent,
        EtherpadWidgetConfigComponent,
        GoogleCalendarWidgetConfigComponent,
        GoogleDocsWidgetConfigComponent,
        JitsiWidgetConfigComponent,
        TwitchWidgetConfigComponent,
        YoutubeWidgetConfigComponent,
        AdminComponent,
        AdminHomeComponent,
        AdminWidgetsComponent,
        AdminWidgetEtherpadConfigComponent,
        AdminWidgetJitsiConfigComponent,

        // Vendor
    ],
    providers: [
        ScalarClientApiService,
        ScalarServerApiService,
        DimensionApiService,
        AdminApiService,
        NameService,
        {provide: Window, useValue: window},

        // Vendor
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        AdminWidgetEtherpadConfigComponent,
        AdminWidgetJitsiConfigComponent,
    ]
})
export class AppModule {
    constructor(public appRef: ApplicationRef, injector: Injector) {
        ServiceLocator.injector = injector;
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
