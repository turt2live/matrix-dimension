import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { RiotComponent } from "./riot/riot.component";
import { GenericWidgetWrapperComponent } from "./widget_wrappers/generic/generic.component";
import { VideoWidgetWrapperComponent } from "./widget_wrappers/video/video.component";
import { JitsiWidgetWrapperComponent } from "./widget_wrappers/jitsi/jitsi.component";
import { GCalWidgetWrapperComponent } from "./widget_wrappers/gcal/gcal.component";
import { RiotHomeComponent } from "./riot/riot-home/home.component";
import { CustomWidgetConfigComponent } from "./configs/widget/custom/custom.widget.component";
import { EtherpadWidgetConfigComponent } from "./configs/widget/etherpad/etherpad.widget.component";
import { GoogleCalendarWidgetConfigComponent } from "./configs/widget/google_calendar/gcal.widget.component";
import { GoogleDocsWidgetConfigComponent } from "./configs/widget/google_docs/gdoc.widget.component";
import { JitsiWidgetConfigComponent } from "./configs/widget/jitsi/jitsi.widget.component";
import { TwitchWidgetConfigComponent } from "./configs/widget/twitch/twitch.widget.component";

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
                path: "widget",
                children: [
                    {
                        path: "custom",
                        component: CustomWidgetConfigComponent,
                        data: {breadcrumb: "Custom Widgets", name: "Custom Widgets"}
                    },
                    {
                        path: "etherpad",
                        component: EtherpadWidgetConfigComponent,
                        data: {breadcrumb: "Etherpad Widgets", name: "Etherpad Widgets"}
                    },
                    {
                        path: "googlecalendar",
                        component: GoogleCalendarWidgetConfigComponent,
                        data: {breadcrumb: "Google Calendar Widgets", name: "Google Calendar Widgets"}
                    },
                    {
                        path: "googledocs",
                        component: GoogleDocsWidgetConfigComponent,
                        data: {breadcrumb: "Google Doc Widgets", name: "Google Doc Widgets"}
                    },
                    {
                        path: "jitsi",
                        component: JitsiWidgetConfigComponent,
                        data: {breadcrumb: "Jitsi Widgets", name: "Jitsi Widgets"}
                    },
                    {
                        path: "twitch",
                        component: TwitchWidgetConfigComponent,
                        data: {breadcrumb: "Twitch Livestream Widgets", name: "Twitch Livestream Widgets"}
                    },
                ],
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
        ]
    },
];

export const routing = RouterModule.forRoot(routes);
