import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { RiotComponent } from "./riot/riot.component";
import { WidgetWrapperComponent } from "./widget_wrapper/widget_wrapper.component";

const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "riot", component: RiotComponent},
    {path: "riot/widget_wrapper", component: WidgetWrapperComponent},
];

export const routing = RouterModule.forRoot(routes);
