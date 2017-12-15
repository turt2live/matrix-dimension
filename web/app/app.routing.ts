import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { RiotComponent } from "./riot/riot.component";
import { GenericWidgetWrapperComponent } from "./widget_wrappers/generic/generic.component";
import { VideoWidgetWrapperComponent } from "./widget_wrappers/video/video.component";
import { JitsiWidgetWrapperComponent } from "./widget_wrappers/jitsi/jitsi.component";
import { GCalWidgetWrapperComponent } from "./widget_wrappers/gcal/gcal.component";
import { RiotHomeComponent } from "./riot/riot-home/home.component";

const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "riot", pathMatch: "full", redirectTo: "riot-app/home"},
    {
        path: "riot-app",
        component: RiotComponent,
        children: [
            {
                path: "home",
                component: RiotHomeComponent,
                data: {breadcrumb: "Home", name: "Dimension"},
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
