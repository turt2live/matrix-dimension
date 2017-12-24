import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AdminApiService } from "../shared/services/admin-api.service";

@Component({
    templateUrl: "./admin.component.html",
    styleUrls: ["./admin.component.scss"],
})
export class AdminComponent {

    public version = "";

    constructor(private router: Router, adminApi: AdminApiService) {
        adminApi.getVersion().then(r => this.version = r.version);
    }

    public goto(adminRoute: string) {
        const currentRoute = this.router.routerState.snapshot.url;
        const baseRoute = currentRoute.substring(0, currentRoute.indexOf("/admin"));

        const route = adminRoute ? [baseRoute, "admin", adminRoute] : [baseRoute, "admin"];
        this.router.navigate(route);
    }

    public isActive(adminRoute: string, exact?: boolean) {
        let currentRoute = this.router.routerState.snapshot.url;
        currentRoute = currentRoute.substring(currentRoute.indexOf('/admin'));

        // Specifically for the dashboard handling
        if (adminRoute === "" && !currentRoute.endsWith("/")) currentRoute = currentRoute + "/";

        if (exact) return currentRoute === "/admin/" + adminRoute;
        return currentRoute.startsWith("/admin/" + adminRoute);
    }
}
