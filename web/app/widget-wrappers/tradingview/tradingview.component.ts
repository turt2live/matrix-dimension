import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as $ from "jquery";

declare var TradingView: any;

@Component({
    selector: "my-tradingview-widget-wrapper",
    templateUrl: "tradingview.component.html",
    styleUrls: ["tradingview.component.scss"],
})
export class TradingViewWidgetWrapperComponent implements OnInit {

    private symbol: string;
    private interval: string;

    constructor(activatedRoute: ActivatedRoute) {
        let params: any = activatedRoute.snapshot.queryParams;

        this.symbol = params.pair;
        this.interval = params.interval;
    }

    public ngOnInit() {
        $.getScript("https://s3.tradingview.com/tv.js", () => {
            const widget = new TradingView.widget({
                "autosize": true,
                "symbol": this.symbol,
                "interval": this.interval,
                "timezone": "Etc/UTC",
                "theme": "Light",
                "style": "1",
                "locale": "en",
                "toolbar_bg": "#f1f3f6",
                "enable_publishing": false,
                "hide_top_toolbar": true,
                "hide_legend": true,
                "container_id": "tradingviewContainer",
            });
            console.log("Created widget: " + widget);
        });
    }
}
