import { ApplicationRef, Injector, NgModule } from "@angular/core";
import { ModalModule } from "ngx-modialog";
import { BootstrapModalModule } from "ngx-modialog/plugins/bootstrap";
import { BreadcrumbsModule } from "ng2-breadcrumbs";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { UiSwitchModule } from "angular2-ui-switch";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { routing } from "./app.routing";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { createNewHosts, removeNgStyles } from "@angularclass/hmr";
import { RiotComponent } from "./riot/riot.component";
import { ScalarClientApiService } from "./shared/services/scalar/scalar-client-api.service";
import { ToasterModule, ToasterService } from "angular2-toaster";
import { ScalarCloseComponent } from "./riot/scalar-close/scalar-close.component";
import { GenericWidgetWrapperComponent } from "./widget-wrappers/generic/generic.component";
import { ToggleFullscreenDirective } from "./shared/directives/toggle-fullscreen.directive";
import { FullscreenButtonComponent } from "./elements/fullscreen-button/fullscreen-button.component";
import { VideoWidgetWrapperComponent } from "./widget-wrappers/video/video.component";
import { JitsiWidgetWrapperComponent } from "./widget-wrappers/jitsi/jitsi.component";
import { GCalWidgetWrapperComponent } from "./widget-wrappers/gcal/gcal.component";
import { PageHeaderComponent } from "./page-header/page-header.component";
import { SpinnerComponent } from "./elements/spinner/spinner.component";
import { RiotHomeComponent } from "./riot/riot-home/home.component";
import { IntegrationBagComponent } from "./integration-bag/integration-bag.component";
import { ScalarServerApiService } from "./shared/services/scalar/scalar-server-api.service";
import { AdminApiService } from "./shared/services/admin/admin-api.service";
import { ServiceLocator } from "./shared/registry/locator.service";
import { IboxComponent } from "./elements/ibox/ibox.component";
import { CustomWidgetConfigComponent } from "./configs/widget/custom/custom.widget.component";
import { ConfigScreenWidgetComponent } from "./configs/widget/config-screen/config-screen.widget.component";
import { EtherpadWidgetConfigComponent } from "./configs/widget/etherpad/etherpad.widget.component";
import { NameService } from "./shared/services/name.service";
import { GoogleCalendarWidgetConfigComponent } from "./configs/widget/google-calendar/gcal.widget.component";
import { GoogleDocsWidgetConfigComponent } from "./configs/widget/google-docs/gdoc.widget.component";
import { JitsiWidgetConfigComponent } from "./configs/widget/jitsi/jitsi.widget.component";
import { TwitchWidgetConfigComponent } from "./configs/widget/twitch/twitch.widget.component";
import { YoutubeWidgetConfigComponent } from "./configs/widget/youtube/youtube.widget.component";
import { AdminComponent } from "./admin/admin.component";
import { AdminHomeComponent } from "./admin/home/home.component";
import { AdminWidgetsComponent } from "./admin/widgets/widgets.component";
import { AdminWidgetEtherpadConfigComponent } from "./admin/widgets/etherpad/etherpad.component";
import { AdminWidgetJitsiConfigComponent } from "./admin/widgets/jitsi/jitsi.component";
import { AdminIntegrationsApiService } from "./shared/services/admin/admin-integrations-api.service";
import { IntegrationsApiService } from "./shared/services/integrations/integrations-api.service";
import { WidgetApiService } from "./shared/services/integrations/widget-api.service";
import { AdminAppserviceApiService } from "./shared/services/admin/admin-appservice-api.service";
import { AdminNebApiService } from "./shared/services/admin/admin-neb-api.service";
import { AdminUpstreamApiService } from "./shared/services/admin/admin-upstream-api.service";
import { AdminNebComponent } from "./admin/neb/neb.component";
import { AdminEditNebComponent } from "./admin/neb/edit/edit.component";
import { AdminAddSelfhostedNebComponent } from "./admin/neb/add-selfhosted/add-selfhosted.component";
import { AdminNebAppserviceConfigComponent } from "./admin/neb/appservice-config/appservice-config.component";
import { AdminNebGiphyConfigComponent } from "./admin/neb/config/giphy/giphy.component";
import { AdminNebGuggyConfigComponent } from "./admin/neb/config/guggy/guggy.component";
import { AdminNebGoogleConfigComponent } from "./admin/neb/config/google/google.component";
import { AdminNebImgurConfigComponent } from "./admin/neb/config/imgur/imgur.component";
import { ConfigSimpleBotComponent } from "./configs/simple-bot/simple-bot.component";
import { ConfigScreenComplexBotComponent } from "./configs/complex-bot/config-screen/config-screen.complex-bot.component";
import { RssComplexBotConfigComponent } from "./configs/complex-bot/rss/rss.complex-bot.component";
import { TravisCiComplexBotConfigComponent } from "./configs/complex-bot/travisci/travisci.complex-bot.component";
import { ConfigScreenBridgeComponent } from "./configs/bridge/config-screen/config-screen.bridge.component";
import { AdminBridgesComponent } from "./admin/bridges/bridges.component";
import { AdminIrcBridgeComponent } from "./admin/bridges/irc/irc.component";
import { AdminIrcApiService } from "./shared/services/admin/admin-irc-api.service";
import { AdminIrcBridgeNetworksComponent } from "./admin/bridges/irc/networks/networks.component";
import { AdminIrcBridgeAddSelfhostedComponent } from "./admin/bridges/irc/add-selfhosted/add-selfhosted.component";
import { IrcBridgeConfigComponent } from "./configs/bridge/irc/irc.bridge.component";
import { IrcApiService } from "./shared/services/integrations/irc-api.service";
import { ScreenshotCapableDirective } from "./shared/directives/screenshot-capable.directive";
import { AdminStickersApiService } from "./shared/services/admin/admin-stickers-api-service";
import { AdminStickerPacksComponent } from "./admin/sticker-packs/sticker-packs.component";
import { AdminStickerPackPreviewComponent } from "./admin/sticker-packs/preview/preview.component";
import { MediaService } from "./shared/services/media.service";
import { StickerApiService } from "./shared/services/integrations/sticker-api.service";
import { StickerpickerComponent } from "./configs/stickerpicker/stickerpicker.component";
import { StickerPickerWidgetWrapperComponent } from "./widget-wrappers/sticker-picker/sticker-picker.component";
import { AdminTelegramApiService } from "./shared/services/admin/admin-telegram-api.service";
import { AdminTelegramBridgeComponent } from "./admin/bridges/telegram/telegram.component";
import { AdminTelegramBridgeManageSelfhostedComponent } from "./admin/bridges/telegram/manage-selfhosted/manage-selfhosted.component";
import { TelegramApiService } from "./shared/services/integrations/telegram-api.service";
import { TelegramBridgeConfigComponent } from "./configs/bridge/telegram/telegram.bridge.component";
import { TelegramAskUnbridgeComponent } from "./configs/bridge/telegram/ask-unbridge/ask-unbridge.component";
import { TelegramCannotUnbridgeComponent } from "./configs/bridge/telegram/cannot-unbridge/cannot-unbridge.component";
import { AdminWebhooksBridgeManageSelfhostedComponent } from "./admin/bridges/webhooks/manage-selfhosted/manage-selfhosted.component";
import { AdminWebhooksBridgeComponent } from "./admin/bridges/webhooks/webhooks.component";
import { AdminWebhooksApiService } from "./shared/services/admin/admin-webhooks-api.service";
import { WebhooksApiService } from "./shared/services/integrations/webhooks-api.service";
import { WebhooksBridgeConfigComponent } from "./configs/bridge/webhooks/webhooks.bridge.component";
import { AdminGitterBridgeComponent } from "./admin/bridges/gitter/gitter.component";
import { AdminGitterBridgeManageSelfhostedComponent } from "./admin/bridges/gitter/manage-selfhosted/manage-selfhosted.component";
import { AdminGitterApiService } from "./shared/services/admin/admin-gitter-api.service";
import { GitterBridgeConfigComponent } from "./configs/bridge/gitter/gitter.bridge.component";
import { GitterApiService } from "./shared/services/integrations/gitter-api.service";
import { GenericFullscreenWidgetWrapperComponent } from "./widget-wrappers/generic-fullscreen/generic-fullscreen.component";
import { GrafanaWidgetConfigComponent } from "./configs/widget/grafana/grafana.widget.component";
import { TradingViewWidgetConfigComponent } from "./configs/widget/tradingview/tradingview.widget.component";
import { TradingViewWidgetWrapperComponent } from "./widget-wrappers/tradingview/tradingview.component";
import { SpotifyWidgetConfigComponent } from "./configs/widget/spotify/spotify.widget.component";
import { SpotifyWidgetWrapperComponent } from "./widget-wrappers/spotify/spotify.component";
import { AdminCustomSimpleBotsApiService } from "./shared/services/admin/admin-custom-simple-bots-api.service";
import { AdminCustomBotsComponent } from "./admin/custom-bots/custom-bots.component";
import { AdminAddCustomBotComponent } from "./admin/custom-bots/add/add.component";
import { SlackApiService } from "./shared/services/integrations/slack-api.service";
import { SlackBridgeConfigComponent } from "./configs/bridge/slack/slack.bridge.component";
import { AdminSlackBridgeManageSelfhostedComponent } from "./admin/bridges/slack/manage-selfhosted/manage-selfhosted.component";
import { AdminSlackBridgeComponent } from "./admin/bridges/slack/slack.component";
import { AdminSlackApiService } from "./shared/services/admin/admin-slack-api.service";
import { AdminLogoutConfirmationDialogComponent } from "./admin/home/logout-confirmation/logout-confirmation.component";
import { ReauthExampleWidgetWrapperComponent } from "./widget-wrappers/reauth-example/reauth-example.component";
import { ManagerTestWidgetWrapperComponent } from "./widget-wrappers/manager-test/manager-test.component";
import { AdminTermsApiService } from "./shared/services/admin/admin-terms-api.service";
import { AdminTermsComponent } from "./admin/terms/terms.component";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { AdminNewEditTermsComponent } from "./admin/terms/new-edit/new-edit.component";
import { AdminTermsNewEditPublishDialogComponent } from "./admin/terms/new-edit/publish/publish.component";
import { TermsWidgetWrapperComponent } from "./widget-wrappers/terms/terms.component";
import { BigBlueButtonConfigComponent } from "./configs/widget/bigbluebutton/bigbluebutton.widget.component";
import { BigBlueButtonApiService } from "./shared/services/integrations/bigbluebutton-api.service";

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        routing,
        NgbModule,
        UiSwitchModule,
        ToasterModule,
        BrowserAnimationsModule,
        ModalModule.forRoot(),
        BootstrapModalModule,
        BreadcrumbsModule,
        CKEditorModule,
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
        BigBlueButtonConfigComponent,
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
        AdminNebComponent,
        AdminEditNebComponent,
        AdminAddSelfhostedNebComponent,
        AdminNebAppserviceConfigComponent,
        AdminNebGiphyConfigComponent,
        AdminNebGuggyConfigComponent,
        AdminNebGoogleConfigComponent,
        AdminNebImgurConfigComponent,
        ConfigSimpleBotComponent,
        ConfigScreenComplexBotComponent,
        RssComplexBotConfigComponent,
        TravisCiComplexBotConfigComponent,
        ConfigScreenBridgeComponent,
        AdminBridgesComponent,
        AdminIrcBridgeComponent,
        AdminIrcBridgeNetworksComponent,
        AdminIrcBridgeAddSelfhostedComponent,
        IrcBridgeConfigComponent,
        ScreenshotCapableDirective,
        AdminStickerPacksComponent,
        AdminStickerPackPreviewComponent,
        StickerpickerComponent,
        StickerPickerWidgetWrapperComponent,
        AdminTelegramBridgeComponent,
        AdminTelegramBridgeManageSelfhostedComponent,
        TelegramBridgeConfigComponent,
        TelegramAskUnbridgeComponent,
        TelegramCannotUnbridgeComponent,
        AdminWebhooksBridgeManageSelfhostedComponent,
        AdminWebhooksBridgeComponent,
        WebhooksBridgeConfigComponent,
        AdminGitterBridgeComponent,
        AdminGitterBridgeManageSelfhostedComponent,
        GitterBridgeConfigComponent,
        GenericFullscreenWidgetWrapperComponent,
        GrafanaWidgetConfigComponent,
        TradingViewWidgetConfigComponent,
        TradingViewWidgetWrapperComponent,
        SpotifyWidgetConfigComponent,
        SpotifyWidgetWrapperComponent,
        AdminCustomBotsComponent,
        AdminAddCustomBotComponent,
        SlackBridgeConfigComponent,
        AdminSlackBridgeManageSelfhostedComponent,
        AdminSlackBridgeComponent,
        AdminLogoutConfirmationDialogComponent,
        ReauthExampleWidgetWrapperComponent,
        ManagerTestWidgetWrapperComponent,
        AdminTermsComponent,
        AdminNewEditTermsComponent,
        AdminTermsNewEditPublishDialogComponent,
        TermsWidgetWrapperComponent,

        // Vendor
    ],
    providers: [
        AdminApiService,
        AdminIntegrationsApiService,
        IntegrationsApiService,
        WidgetApiService,
        ScalarClientApiService,
        ScalarServerApiService,
        NameService,
        AdminAppserviceApiService,
        AdminNebApiService,
        AdminUpstreamApiService,
        AdminIrcApiService,
        IrcApiService,
        AdminStickersApiService,
        MediaService,
        StickerApiService,
        BigBlueButtonApiService,
        AdminTelegramApiService,
        TelegramApiService,
        AdminWebhooksApiService,
        WebhooksApiService,
        AdminGitterApiService,
        GitterApiService,
        AdminCustomSimpleBotsApiService,
        SlackApiService,
        AdminSlackApiService,
        ToasterService,
        AdminTermsApiService,
        {provide: Window, useValue: window},

        // Vendor
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        AdminWidgetEtherpadConfigComponent,
        AdminWidgetJitsiConfigComponent,
        AdminNebAppserviceConfigComponent,
        AdminNebGiphyConfigComponent,
        AdminNebGuggyConfigComponent,
        AdminNebGoogleConfigComponent,
        AdminNebImgurConfigComponent,
        ConfigSimpleBotComponent,
        AdminIrcBridgeNetworksComponent,
        AdminIrcBridgeAddSelfhostedComponent,
        AdminStickerPackPreviewComponent,
        AdminTelegramBridgeManageSelfhostedComponent,
        TelegramAskUnbridgeComponent,
        TelegramCannotUnbridgeComponent,
        AdminWebhooksBridgeManageSelfhostedComponent,
        AdminGitterBridgeManageSelfhostedComponent,
        AdminAddCustomBotComponent,
        AdminSlackBridgeManageSelfhostedComponent,
        AdminLogoutConfirmationDialogComponent,
        AdminTermsNewEditPublishDialogComponent,
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
