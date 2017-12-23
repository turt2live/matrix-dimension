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
                children: [],
                // children: [
                //     {
                //         path: "custom",
                //         component: NewTestWidgetComponent,
                //         data: {breadcrumb: "Custom Widgets", name: "Custom Widgets"}
                //     },
                // ],
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
