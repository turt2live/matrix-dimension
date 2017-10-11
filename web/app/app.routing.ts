import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { RiotComponent } from "./riot/riot.component";
import { GenericWidgetWrapperComponent } from "./widget_wrappers/generic/generic.component";
import { VideoWidgetWrapperComponent } from "./widget_wrappers/video/video.component";

const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "riot", component: RiotComponent},
    {path: "widgets/generic", component: GenericWidgetWrapperComponent},
    {path: "widgets/video", component: VideoWidgetWrapperComponent},
];

export const routing = RouterModule.forRoot(routes);
