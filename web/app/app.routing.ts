import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { ElementComponent } from "./element/element.component";
import { GenericWidgetWrapperComponent } from "./widget-wrappers/generic/generic.component";
import { BigBlueButtonWidgetWrapperComponent } from "./widget-wrappers/bigbluebutton/bigbluebutton.component";
import { BigBlueButtonConfigComponent } from "./configs/widget/bigbluebutton/bigbluebutton.widget.component";
import { VideoWidgetWrapperComponent } from "./widget-wrappers/video/video.component";
import { JitsiWidgetWrapperComponent } from "./widget-wrappers/jitsi/jitsi.component";
import { GCalWidgetWrapperComponent } from "./widget-wrappers/gcal/gcal.component";
import { ElementHomeComponent } from "./element/element-home/home.component";
import { CustomWidgetConfigComponent } from "./configs/widget/custom/custom.widget.component";
import { EtherpadWidgetConfigComponent } from "./configs/widget/etherpad/etherpad.widget.component";
import { GoogleCalendarWidgetConfigComponent } from "./configs/widget/google-calendar/gcal.widget.component";
import { GoogleDocsWidgetConfigComponent } from "./configs/widget/google-docs/gdoc.widget.component";
import { JitsiWidgetConfigComponent } from "./configs/widget/jitsi/jitsi.widget.component";
import { TwitchWidgetConfigComponent } from "./configs/widget/twitch/twitch.widget.component";
import { YoutubeWidgetConfigComponent } from "./configs/widget/youtube/youtube.widget.component";
import { AdminComponent } from "./admin/admin.component";
import { AdminHomeComponent } from "./admin/home/home.component";
import { AdminWidgetsComponent } from "./admin/widgets/widgets.component";
import { AdminNebComponent } from "./admin/neb/neb.component";
import { AdminEditNebComponent } from "./admin/neb/edit/edit.component";
import { AdminAddSelfhostedNebComponent } from "./admin/neb/add-selfhosted/add-selfhosted.component";
import { RssComplexBotConfigComponent } from "./configs/complex-bot/rss/rss.complex-bot.component";
import { TravisCiComplexBotConfigComponent } from "./configs/complex-bot/travisci/travisci.complex-bot.component";
import { AdminBridgesComponent } from "./admin/bridges/bridges.component";
import { AdminIrcBridgeComponent } from "./admin/bridges/irc/irc.component";
import { IrcBridgeConfigComponent } from "./configs/bridge/irc/irc.bridge.component";
import { AdminStickerPacksComponent } from "./admin/sticker-packs/sticker-packs.component";
import { StickerpickerComponent } from "./configs/stickerpicker/stickerpicker.component";
import { StickerPickerWidgetWrapperComponent } from "./widget-wrappers/sticker-picker/sticker-picker.component";
import { AdminTelegramBridgeComponent } from "./admin/bridges/telegram/telegram.component";
import { TelegramBridgeConfigComponent } from "./configs/bridge/telegram/telegram.bridge.component";
import { AdminWebhooksBridgeComponent } from "./admin/bridges/webhooks/webhooks.component";
import { WebhooksBridgeConfigComponent } from "./configs/bridge/webhooks/webhooks.bridge.component";
import {
    GenericFullscreenWidgetWrapperComponent
} from "./widget-wrappers/generic-fullscreen/generic-fullscreen.component";
import { GrafanaWidgetConfigComponent } from "./configs/widget/grafana/grafana.widget.component";
import { TradingViewWidgetConfigComponent } from "./configs/widget/tradingview/tradingview.widget.component";
import { TradingViewWidgetWrapperComponent } from "./widget-wrappers/tradingview/tradingview.component";
import { SpotifyWidgetConfigComponent } from "./configs/widget/spotify/spotify.widget.component";
import { SpotifyWidgetWrapperComponent } from "./widget-wrappers/spotify/spotify.component";
import { AdminCustomBotsComponent } from "./admin/custom-bots/custom-bots.component";
import { AdminSlackBridgeComponent } from "./admin/bridges/slack/slack.component";
import { SlackBridgeConfigComponent } from "./configs/bridge/slack/slack.bridge.component";
import { ReauthExampleWidgetWrapperComponent } from "./widget-wrappers/reauth-example/reauth-example.component";
import { ManagerTestWidgetWrapperComponent } from "./widget-wrappers/manager-test/manager-test.component";
import { AdminTermsComponent } from "./admin/terms/terms.component";
import { AdminNewEditTermsComponent } from "./admin/terms/new-edit/new-edit.component";
import { TermsWidgetWrapperComponent } from "./widget-wrappers/terms/terms.component";
import { WhiteboardWidgetComponent } from "./configs/widget/whiteboard/whiteboard.widget.component";
import { AdminHookshotGithubBridgeComponent } from "./admin/bridges/hookshot-github/hookshot-github.component";
import { HookshotGithubBridgeConfigComponent } from "./configs/bridge/hookshot-github/hookshot-github.bridge.component";
import { AdminHookshotJiraBridgeComponent } from "./admin/bridges/hookshot-jira/hookshot-jira.component";
import { HookshotJiraBridgeConfigComponent } from "./configs/bridge/hookshot-jira/hookshot-jira.bridge.component";
import { AdminHookshotWebhookBridgeComponent } from "./admin/bridges/hookshot-webhook/hookshot-webhook.component";
import {
    HookshotWebhookBridgeConfigComponent
} from "./configs/bridge/hookshot-webhook/hookshot-webhook.bridge.component";

const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "riot", pathMatch: "full", redirectTo: "riot-app", data: {breadcrumb: "Home", name: "Integration manager"}},
    {path: "element", pathMatch: "full", redirectTo: "riot-app", data: {breadcrumb: "Home", name: "Integration manager"}},
    {
        path: "riot-app",
        component: ElementComponent,
        data: {breadcrumb: "Home", name: "Integration manager"},
        children: [
            {
                path: "",
                component: ElementHomeComponent,
            },
            {
                path: "admin",
                component: AdminComponent,
                data: {breadcrumb: "Admin", name: "Settings"},
                children: [
                    {
                        path: "",
                        component: AdminHomeComponent,
                    },
                    {
                        path: "widgets",
                        component: AdminWidgetsComponent,
                        data: {breadcrumb: "Widgets", name: "Widgets"},
                    },
                    {
                        path: "neb",
                        data: {breadcrumb: "go-neb", name: "go-neb configuration"},
                        children: [
                            {
                                path: "",
                                component: AdminNebComponent,
                            },
                            {
                                path: ":nebId/edit",
                                component: AdminEditNebComponent,
                                data: {breadcrumb: "Edit go-neb", name: "Edit go-neb"},
                            },
                            {
                                path: "new/selfhosted",
                                component: AdminAddSelfhostedNebComponent,
                                data: {breadcrumb: "Add self-hosted go-neb", name: "Add self-hosted go-neb"},
                            },
                        ]
                    },
                    {
                        path: "custom-bots",
                        data: {breadcrumb: "Custom bots", name: "Custom bots"},
                        children: [
                            {
                                path: "",
                                component: AdminCustomBotsComponent,
                            }
                        ]
                    },
                    {
                        path: "bridges",
                        data: {breadcrumb: "Bridges", name: "Bridges"},
                        children: [
                            {
                                path: "",
                                component: AdminBridgesComponent,
                            },
                            {
                                path: "irc",
                                component: AdminIrcBridgeComponent,
                                data: {breadcrumb: "IRC Bridge", name: "IRC Bridge"},
                            },
                            {
                                path: "telegram",
                                component: AdminTelegramBridgeComponent,
                                data: {breadcrumb: "Telegram Bridge", name: "Telegram Bridge"},
                            },
                            {
                                path: "webhooks",
                                component: AdminWebhooksBridgeComponent,
                                data: {breadcrumb: "Webhook Bridge", name: "Webhook Bridge"},
                            },
                            {
                                path: "slack",
                                component: AdminSlackBridgeComponent,
                                data: {breadcrumb: "Slack Bridge", name: "Slack Bridge"},
                            },
                            {
                                path: "hookshot_github",
                                component: AdminHookshotGithubBridgeComponent,
                                data: {breadcrumb: "Github Bridge", name: "Github Bridge"},
                            },
                            {
                                path: "hookshot_jira",
                                component: AdminHookshotJiraBridgeComponent,
                                data: {breadcrumb: "Jira Bridge", name: "Jira Bridge"},
                            },
                            {
                                path: "hookshot_webhook",
                                component: AdminHookshotWebhookBridgeComponent,
                                data: {breadcrumb: "Webhook Bridge", name: "Webhook Bridge"},
                            },
                        ],
                    },
                    {
                        path: "stickerpacks",
                        data: {breadcrumb: "Sticker Packs", name: "Sticker Packs"},
                        children: [
                            {
                                path: "",
                                component: AdminStickerPacksComponent,
                            },
                        ],
                    },
                    {
                        path: "terms",
                        data: {breadcrumb: "Terms of Service", name: "Terms of Service"},
                        children: [
                            {
                                path: "",
                                component: AdminTermsComponent,
                            },
                            {
                                path: "new",
                                component: AdminNewEditTermsComponent,
                                data: {breadcrumb: "New policy", name: "New policy"},
                            },
                            {
                                path: "edit/:shortcode",
                                component: AdminNewEditTermsComponent,
                                data: {breadcrumb: "Edit policy", name: "Edit policy"},
                            },
                        ],
                    },
                ],
            },
            {
                path: "widget",
                data: {breadcrumb: {skip: true}},
                children: [
                    {
                        path: "custom",
                        component: CustomWidgetConfigComponent,
                        data: {breadcrumb: "Custom Widgets", name: "Custom Widgets"},
                    },
                    {
                        path: "bigbluebutton",
                        component: BigBlueButtonConfigComponent,
                        data: {breadcrumb: "BigBlueButton", name: "BigBlueButton"},
                    },
                    {
                        path: "etherpad",
                        component: EtherpadWidgetConfigComponent,
                        data: {breadcrumb: "Etherpad", name: "Etherpad"},
                    },
                    {
                        path: "googlecalendar",
                        component: GoogleCalendarWidgetConfigComponent,
                        data: {breadcrumb: "Google Calendar", name: "Google Calendar"},
                    },
                    {
                        path: "googledocs",
                        component: GoogleDocsWidgetConfigComponent,
                        data: {breadcrumb: "Google Docs", name: "Google Docs"},
                    },
                    {
                        path: "jitsi",
                        component: JitsiWidgetConfigComponent,
                        data: {breadcrumb: "Jitsi", name: "Jitsi"},
                    },
                    {
                        path: "twitch",
                        component: TwitchWidgetConfigComponent,
                        data: {breadcrumb: "Twitch Livestream", name: "Twitch Livestream"},
                    },
                    {
                        path: "youtube",
                        component: YoutubeWidgetConfigComponent,
                        data: {breadcrumb: "Youtube", name: "Youtube"},
                    },
                    {
                        path: "grafana",
                        component: GrafanaWidgetConfigComponent,
                        data: {breadcrumb: "Grafana", name: "Grafana"},
                    },
                    {
                        path: "tradingview",
                        component: TradingViewWidgetConfigComponent,
                        data: {breadcrumb: "TradingView", name: "TradingView"},
                    },
                    {
                        path: "spotify",
                        component: SpotifyWidgetConfigComponent,
                        data: {breadcrumb: "Spotify", name: "Spotify"},
                    },
                    {
                        path: "whiteboard",
                        component: WhiteboardWidgetComponent,
                        data: {breadcrumb: "Whiteboard", name: "Whiteboard"},
                    },
                ],
            },
            {
                path: "complex-bot",
                data: {breadcrumb: {skip: true}},
                children: [
                    {
                        path: "rss",
                        component: RssComplexBotConfigComponent,
                        data: {breadcrumb: "RSS Bot", name: "RSS Bot"},
                    },
                    {
                        path: "travisci",
                        component: TravisCiComplexBotConfigComponent,
                        data: {breadcrumb: "Travis CI", name: "Travis CI"},
                    },
                ],
            },
            {
                path: "bridge",
                data: {breadcrumb: {skip: true}},
                children: [
                    {
                        path: "irc",
                        component: IrcBridgeConfigComponent,
                        data: {breadcrumb: "IRC Bridge", name: "IRC Bridge"},
                    },
                    {
                        path: "telegram",
                        component: TelegramBridgeConfigComponent,
                        data: {breadcrumb: "Telegram Bridge", name: "Telegram Bridge"},
                    },
                    {
                        path: "webhooks",
                        component: WebhooksBridgeConfigComponent,
                        data: {breadcrumb: "Webhooks Bridge", name: "Webhooks Bridge"},
                    },
                    {
                        path: "slack",
                        component: SlackBridgeConfigComponent,
                        data: {breadcrumb: "Slack Bridge", name: "Slack Bridge"},
                    },
                    {
                        path: "hookshot_github",
                        component: HookshotGithubBridgeConfigComponent,
                        data: {breadcrumb: "Github Bridge", name: "Github Bridge"},
                    },
                    {
                        path: "hookshot_jira",
                        component: HookshotJiraBridgeConfigComponent,
                        data: {breadcrumb: "Jira Bridge", name: "Jira Bridge"},
                    },
                    {
                        path: "hookshot_webhook",
                        component: HookshotWebhookBridgeConfigComponent,
                        data: {breadcrumb: "Webhooks Bridge", name: "Webhooks Bridge"},
                    },
                ],
            },
            {
                path: "stickerpicker",
                component: StickerpickerComponent,
                data: {breadcrumb: "Your Sticker Packs", name: "Your Sticker Packs"},
            },
        ],
    },
    {
        path: "widgets",
        data: {breadcrumb: {skip: true}},
        children: [
            {path: "terms/:shortcode/:lang/:version", component: TermsWidgetWrapperComponent},
            {path: "generic", component: GenericWidgetWrapperComponent},
            {path: "video", component: VideoWidgetWrapperComponent},
            {path: "jitsi", component: JitsiWidgetWrapperComponent},
            {path: "bigbluebutton", component: BigBlueButtonWidgetWrapperComponent},
            {path: "gcal", component: GCalWidgetWrapperComponent},
            {path: "stickerpicker", component: StickerPickerWidgetWrapperComponent},
            {path: "generic-fullscreen", component: GenericFullscreenWidgetWrapperComponent},
            {path: "tradingview", component: TradingViewWidgetWrapperComponent},
            {path: "spotify", component: SpotifyWidgetWrapperComponent},
            {path: "reauth", component: ReauthExampleWidgetWrapperComponent},
            {path: "manager-test", component: ManagerTestWidgetWrapperComponent},
        ]
    },
];

export const routing = RouterModule.forRoot(routes);
