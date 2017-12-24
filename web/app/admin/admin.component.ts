import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    templateUrl: "./admin.component.html",
    styleUrls: ["./admin.component.scss"],
})
export class AdminComponent {

    constructor(private router: Router) {
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
