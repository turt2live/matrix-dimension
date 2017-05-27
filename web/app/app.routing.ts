import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { RiotComponent } from "./riot/riot.component";

const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'riot', component: RiotComponent},
];

export const routing = RouterModule.forRoot(routes);
