import { Component } from "@angular/core";
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "my-page-header",
    templateUrl: "./page-header.component.html",
    styleUrls: ["./page-header.component.scss"],
})
export class PageHeaderComponent {

    public pageName: string;

    constructor(private router: Router, private activatedRoute: ActivatedRoute, public translate: TranslateService) {
        this.translate = translate;
        this.router.events.filter(ev => ev instanceof NavigationEnd).subscribe((ev: NavigationEnd) => {
            let currentRoute = this.activatedRoute.root;
            let url = "";

            while (currentRoute.children.length > 0) {
                let children = currentRoute.children;
                children.forEach(route => {
                    if (route.snapshot.data['breadcrumb']) {
                        this.translate.get(route.snapshot.data['breadcrumb']).subscribe((res: string) => {route.snapshot.data['breadcrumb'] = res});
                    }
                    currentRoute = route;
                    url += "/" + route.snapshot.url.map(s => s.path).join("/");
                    if (route.outlet !== PRIMARY_OUTLET) return;
                    if (!route.routeConfig || !route.routeConfig.data) return;
                    if (url === ev.urlAfterRedirects.split("?")[0]) this.pageName = route.snapshot.data.name;
                });
            }
        });
    }
}
