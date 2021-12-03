import { Component } from "@angular/core";
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router, } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { filter } from "rxjs/operators";

@Component({
    selector: "my-page-header",
    templateUrl: "./page-header.component.html",
    styleUrls: ["./page-header.component.scss"],
})
export class PageHeaderComponent {
    public pageName: string;
    public isHome = true;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public translate: TranslateService
    ) {
        this.router.events
            .pipe(filter((ev) => ev instanceof NavigationEnd))
            .subscribe((ev) => {
                let currentRoute = this.activatedRoute.root;
                let url = "";
                const event = ev as NavigationEnd;
                let routeCount = 0;

                while (currentRoute.children.length > 0) {
                    const children = currentRoute.children;
                    children.forEach((route) => {
                        const breadcrumb = route.snapshot.data["breadcrumb"];
                        if (typeof(breadcrumb) === 'string' && !route.snapshot.data['#translated']) {
                            this.translate.get(breadcrumb).subscribe((res: string) => {
                                route.snapshot.data["breadcrumb"] = res;
                                route.snapshot.data['#translated'] = true;
                            });
                        }
                        currentRoute = route;
                        routeCount++;
                        url += "/" + route.snapshot.url.map((s) => s.path).join("/");
                        if (route.outlet !== PRIMARY_OUTLET) return;
                        if (!route.routeConfig || !route.routeConfig.data) return;
                        if (url === event.urlAfterRedirects.split("?")[0]) {
                            this.pageName = route.snapshot.data.name;
                        }
                    });
                }

                this.isHome = routeCount <= 2; // Path of `./riot-app` (2 segments)
            });
    }
}
