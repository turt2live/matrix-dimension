import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { RiotComponent } from "./riot/riot.component";
import { GenericWidgetWrapperComponent } from "./widget-wrappers/generic/generic.component";
import { VideoWidgetWrapperComponent } from "./widget-wrappers/video/video.component";
import { JitsiWidgetWrapperComponent } from "./widget-wrappers/jitsi/jitsi.component";
import { GCalWidgetWrapperComponent } from "./widget-wrappers/gcal/gcal.component";
import { RiotHomeComponent } from "./riot/riot-home/home.component";
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
import { AdminGitterBridgeComponent } from "./admin/bridges/gitter/gitter.component";
import { GitterBridgeConfigComponent } from "./configs/bridge/gitter/gitter.bridge.component";
import { GenericFullscreenWidgetWrapperComponent } from "./widget-wrappers/generic-fullscreen/generic-fullscreen.component";
import { GrafanaWidgetConfigComponent } from "./configs/widget/grafana/grafana.widget.component";
import { TradingViewWidgetConfigComponent } from "./configs/widget/tradingview/tradingview.widget.component";
import { TradingViewWidgetWrapperComponent } from "./widget-wrappers/tradingview/tradingview.component";
import { SpotifyWidgetConfigComponent } from "./configs/widget/spotify/spotify.widget.component";
import { SpotifyWidgetWrapperComponent } from "./widget-wrappers/spotify/spotify.component";
import { AdminCustomBotsComponent } from "./admin/custom-bots/custom-bots.component";
import { AdminSlackBridgeComponent } from "./admin/bridges/slack/slack.component";
import { SlackBridgeConfigComponent } from "./configs/bridge/slack/slack.bridge.component";

const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "riot", pathMatch: "full", redirectTo: "riot-app"},
    {
        path: "riot-app",
        component: RiotComponent,
        data: {breadcrumb: "Home", name: "Dimension"},
        children: [
            {
                path: "",
                component: RiotHomeComponent,
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
                                path: "gitter",
                                component: AdminGitterBridgeComponent,
                                data: {breadcrumb: "Gitter Bridge", name: "Gitter Bridge"},
                            },
                            {
                                path: "slack",
                                component: AdminSlackBridgeComponent,
                                data: {breadcrumb: "Slack Bridge", name: "Slack Bridge"},
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
                    }
                ],
            },
            {
                path: "widget",
                children: [
                    {
                        path: "custom",
                        component: CustomWidgetConfigComponent,
                        data: {breadcrumb: "Custom Widgets", name: "Custom Widgets"},
                    },
                    {
                        path: "etherpad",
                        component: EtherpadWidgetConfigComponent,
                        data: {breadcrumb: "Etherpad Widgets", name: "Etherpad Widgets"},
                    },
                    {
                        path: "googlecalendar",
                        component: GoogleCalendarWidgetConfigComponent,
                        data: {breadcrumb: "Google Calendar Widgets", name: "Google Calendar Widgets"},
                    },
                    {
                        path: "googledocs",
                        component: GoogleDocsWidgetConfigComponent,
                        data: {breadcrumb: "Google Doc Widgets", name: "Google Doc Widgets"},
                    },
                    {
                        path: "jitsi",
                        component: JitsiWidgetConfigComponent,
                        data: {breadcrumb: "Jitsi Widgets", name: "Jitsi Widgets"},
                    },
                    {
                        path: "twitch",
                        component: TwitchWidgetConfigComponent,
                        data: {breadcrumb: "Twitch Livestream Widgets", name: "Twitch Livestream Widgets"},
                    },
                    {
                        path: "youtube",
                        component: YoutubeWidgetConfigComponent,
                        data: {breadcrumb: "Youtube Video Widgets", name: "Youtube Video Widgets"},
                    },
                    {
                        path: "grafana",
                        component: GrafanaWidgetConfigComponent,
                        data: {breadcrumb: "Grafana Widgets", name: "Grafana Widgets"},
                    },
                    {
                        path: "tradingview",
                        component: TradingViewWidgetConfigComponent,
                        data: {breadcrumb: "TradingView Widgets", name: "TradingView Widgets"},
                    },
                    {
                        path: "spotify",
                        component: SpotifyWidgetConfigComponent,
                        data: {breadcrumb: "Spotify Widgets", name: "Spotify Widgets"},
                    },
                ],
            },
            {
                path: "complex-bot",
                children: [
                    {
                        path: "rss",
                        component: RssComplexBotConfigComponent,
                        data: {breadcrumb: "RSS Bot Configuration", name: "RSS Bot Configuration"},
                    },
                    {
                        path: "travisci",
                        component: TravisCiComplexBotConfigComponent,
                        data: {breadcrumb: "Travis CI Configuration", name: "Travis CI Configuration"},
                    },
                ],
            },
            {
                path: "bridge",
                children: [
                    {
                        path: "irc",
                        component: IrcBridgeConfigComponent,
                        data: {breadcrumb: "IRC Bridge Configuration", name: "IRC Bridge Configuration"},
                    },
                    {
                        path: "telegram",
                        component: TelegramBridgeConfigComponent,
                        data: {breadcrumb: "Telegram Bridge Configuration", name: "Telegram Bridge Configuration"},
                    },
                    {
                        path: "webhooks",
                        component: WebhooksBridgeConfigComponent,
                        data: {breadcrumb: "Webhook Bridge Configuration", name: "Webhook Bridge Configuration"},
                    },
                    {
                        path: "gitter",
                        component: GitterBridgeConfigComponent,
                        data: {breadcrumb: "Gitter Bridge Configuration", name: "Gitter Bridge Configuration"},
                    },
                    {
                        path: "slack",
                        component: SlackBridgeConfigComponent,
                        data: {breadcrumb: "Slack Bridge Configuration", name: "Slack Bridge Configuration"},
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
        children: [
            {path: "generic", component: GenericWidgetWrapperComponent},
            {path: "video", component: VideoWidgetWrapperComponent},
            {path: "jitsi", component: JitsiWidgetWrapperComponent},
            {path: "gcal", component: GCalWidgetWrapperComponent},
            {path: "stickerpicker", component: StickerPickerWidgetWrapperComponent},
            {path: "generic-fullscreen", component: GenericFullscreenWidgetWrapperComponent},
            {path: "tradingview", component: TradingViewWidgetWrapperComponent},
            {path: "spotify", component: SpotifyWidgetWrapperComponent},
        ]
    },
];

export const routing = RouterModule.forRoot(routes);
