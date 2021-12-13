import { DISABLE_AUTOMATIC_WRAPPING, WidgetComponent } from "../widget.component";
import { EditableWidget, WIDGET_TRADINGVIEW } from "../../../shared/models/widget";
import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
    templateUrl: "tradingview.widget.component.html",
    styleUrls: ["tradingview.widget.component.scss"],
})
export class TradingViewWidgetConfigComponent extends WidgetComponent {

    public readonly intervals = [
        {key: '1', value: '1 Minute'},
        {key: '3', value: '3 Minutes'},
        {key: '5', value: '5 Minutes'},
        {key: '15', value: '15 Minutes'},
        {key: '30', value: '30 Minutes'},
        {key: '60', value: '1 Hour'},
        {key: '120', value: '2 Hours'},
        {key: '180', value: '3 Hours'},
        {key: '240', value: '4 Hours'},
        {key: 'D', value: '1 Day'},
        {key: 'W', value: '1 Week'},
    ];

    public readonly pairs = [
        // USD
        {key: 'COINBASE:BTCUSD', value: 'Bitcoin / US Dollar'},
        {key: 'COINBASE:ETHUSD', value: 'Ethereum / US Dollar'},
        {key: 'COINBASE:LTCUSD', value: 'Litecoin / US Dollar'},
        {key: 'BITTREX:SNTUSD', value: 'Status Network Token / US Dollar'},
        {key: 'BITTREX:ETCUSD', value: 'Ethereum Classic / US Dollar'},
        {key: 'BITFINEX:BTGUSD', value: 'BTG / US Dollar'},
        {key: 'BITTREX:DASHUSD', value: 'Dash / US Dollar'},
        {key: 'BITFINEX:EOSUSD', value: 'EOS / US Dollar'},
        {key: 'BITFINEX:IOTUSD', value: 'IOTA / US Dollar'},
        {key: 'BITTREX:LSKUSD', value: 'Lisk / US Dollar'},
        {key: 'BITTREX:OMGUSD', value: 'OmiseGo / US Dollar'},
        {key: 'BITTREX:NEOUSD', value: 'NEO / US Dollar'},
        {key: 'BITTREX:XRPUSD', value: 'Ripple / US Dollar'},
        {key: 'BITFINEX:ZECUSD', value: 'Zcash / US Dollar'},
        {key: 'BITFINEX:XMRUSD', value: 'Monero / US Dollar'},

        // Euro / GBP
        {key: 'COINBASE:BTCEUR', value: 'Bitcoin / Euro'},
        {key: 'COINBASE:ETHEUR', value: 'Ethereum / Euro'},
        {key: 'COINBASE:LTCEUR', value: 'Litecoin / Euro'},
        {key: 'COINBASE:BTCGBP', value: 'Bitcoin / GBP'},

        // Bitcoin
        {key: 'COINBASE:ETHBTC', value: 'Ethereum / Bitcoin'},
        {key: 'COINBASE:LTCBTC', value: 'Litecoin / Bitcoin'},
        {key: 'BITTREX:SNTBTC', value: 'Status Network Token / Bitcoin'},
        {key: 'BITTREX:BCCBTC', value: 'Bitcoin Cash / Bitcoin'},
        {key: 'BITTREX:ADABTC', value: 'Ada / Bitcoin'},
        {key: 'BITTREX:ARKBTC', value: 'Ark / Bitcoin'},
        {key: 'BITTREX:EMC2BTC', value: 'Einsteinium / Bitcoin'},
        {key: 'BITFINEX:IOTBTC', value: 'IOTA / Bitcoin'},
        {key: 'BITTREX:LSKBTC', value: 'Lisk / Bitcoin'},
        {key: 'BITTREX:NEOBTC', value: 'Neo / Bitcoin'},
        {key: 'BITTREX:OMGBTC', value: 'OmiseGO / Bitcoin'},
        {key: 'BITTREX:POWRBTC', value: 'PowerLedger / Bitcoin'},
        {key: 'BITTREX:STRATBTC', value: 'Stratis / Bitcoin'},
        {key: 'BITTREX:TRIGBTC', value: 'TRIG Token / Bitcoin'},
        {key: 'BITTREX:VTCBTC', value: 'Vertcoin / Bitcoin'},
        {key: 'BITTREX:XLMBTC', value: 'Lumen / Bitcoin'},
        {key: 'BITTREX:XRPBTC', value: 'Ripple / Bitcoin'},

        // Misc
        {key: 'BITTREX:BTCUSDT', value: 'Bitcoin / Tether USD'},
        {key: 'BITTREX:ETHUSDT', value: 'Ethereum / Tether USD'},
        {key: 'BITTREX:SNTETH', value: 'Status Network Token / Ethereum'},
        {key: 'BITTREX:BCCUSDT', value: 'Bitcoin Cash / Tether USD'},
        {key: 'BITTREX:NEOUSDT', value: 'Neo / Tether'},
    ];

    constructor(public translate: TranslateService) {
        super(WIDGET_TRADINGVIEW, "TradingView Chart", DISABLE_AUTOMATIC_WRAPPING, translate, "tradingView");
    }

    protected OnNewWidgetPrepared(widget: EditableWidget): void {
        widget.dimension.newData.interval = "D"; // 1 day
        widget.dimension.newData.pair = this.pairs[0].key;
    }

    protected OnWidgetBeforeAdd(widget: EditableWidget): void {
        this.setViewUrl(widget);
    }

    protected OnWidgetBeforeEdit(widget: EditableWidget) {
        this.setViewUrl(widget);
    }

    private setViewUrl(widget: EditableWidget) {
        const pair = this.pairs.find(p => p.key === widget.dimension.newData.pair);
        widget.dimension.newTitle = pair ? pair.value : null;
        widget.dimension.newUrl = window.location.origin + "/widgets/tradingview?pair=$pair&interval=$interval";
    }
}
