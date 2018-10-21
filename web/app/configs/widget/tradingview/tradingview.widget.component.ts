import { DISABLE_AUTOMATIC_WRAPPING, WidgetComponent } from "../widget.component";
import { EditableWidget, WIDGET_TRADINGVIEW } from "../../../shared/models/widget";
import { Component } from "@angular/core";

@Component({
    templateUrl: "tradingview.widget.component.html",
    styleUrls: ["tradingview.widget.component.scss"],
})
export class TradingViewWidgetConfigComponent extends WidgetComponent {

    public readonly intervals = [
        {value: '1', label: '1 Minute'},
        {value: '3', label: '3 Minutes'},
        {value: '5', label: '5 Minutes'},
        {value: '15', label: '15 Minutes'},
        {value: '30', label: '30 Minutes'},
        {value: '60', label: '1 Hour'},
        {value: '120', label: '2 Hours'},
        {value: '180', label: '3 Hours'},
        {value: '240', label: '4 Hours'},
        {value: 'D', label: '1 Day'},
        {value: 'W', label: '1 Week'},
    ];

    public readonly pairs = [
        // USD
        {value: 'COINBASE:BTCUSD', label: 'Bitcoin / US Dollar'},
        {value: 'COINBASE:ETHUSD', label: 'Ethereum / US Dollar'},
        {value: 'COINBASE:LTCUSD', label: 'Litecoin / US Dollar'},
        {value: 'BITTREX:SNTUSD', label: 'Status Network Token / US Dollar'},
        {value: 'BITTREX:ETCUSD', label: 'Ethereum Classic / US Dollar'},
        {value: 'BITFINEX:BTGUSD', label: 'BTG / US Dollar'},
        {value: 'BITTREX:DASHUSD', label: 'Dash / US Dollar'},
        {value: 'BITFINEX:EOSUSD', label: 'EOS / US Dollar'},
        {value: 'BITFINEX:IOTUSD', label: 'IOTA / US Dollar'},
        {value: 'BITTREX:LSKUSD', label: 'Lisk / US Dollar'},
        {value: 'BITTREX:OMGUSD', label: 'OmiseGo / US Dollar'},
        {value: 'BITTREX:NEOUSD', label: 'NEO / US Dollar'},
        {value: 'BITTREX:XRPUSD', label: 'Ripple / US Dollar'},
        {value: 'BITFINEX:ZECUSD', label: 'Zcash / US Dollar'},
        {value: 'BITFINEX:XMRUSD', label: 'Monero / US Dollar'},

        // Euro / GBP
        {value: 'COINBASE:BTCEUR', label: 'Bitcoin / Euro'},
        {value: 'COINBASE:ETHEUR', label: 'Ethereum / Euro'},
        {value: 'COINBASE:LTCEUR', label: 'Litecoin / Euro'},
        {value: 'COINBASE:BTCGBP', label: 'Bitcoin / GBP'},

        // Bitcoin
        {value: 'COINBASE:ETHBTC', label: 'Ethereum / Bitcoin'},
        {value: 'COINBASE:LTCBTC', label: 'Litecoin / Bitcoin'},
        {value: 'BITTREX:SNTBTC', label: 'Status Network Token / Bitcoin'},
        {value: 'BITTREX:BCCBTC', label: 'Bitcoin Cash / Bitcoin'},
        {value: 'BITTREX:ADABTC', label: 'Ada / Bitcoin'},
        {value: 'BITTREX:ARKBTC', label: 'Ark / Bitcoin'},
        {value: 'BITTREX:EMC2BTC', label: 'Einsteinium / Bitcoin'},
        {value: 'BITFINEX:IOTBTC', label: 'IOTA / Bitcoin'},
        {value: 'BITTREX:LSKBTC', label: 'Lisk / Bitcoin'},
        {value: 'BITTREX:NEOBTC', label: 'Neo / Bitcoin'},
        {value: 'BITTREX:OMGBTC', label: 'OmiseGO / Bitcoin'},
        {value: 'BITTREX:POWRBTC', label: 'PowerLedger / Bitcoin'},
        {value: 'BITTREX:STRATBTC', label: 'Stratis / Bitcoin'},
        {value: 'BITTREX:TRIGBTC', label: 'TRIG Token / Bitcoin'},
        {value: 'BITTREX:VTCBTC', label: 'Vertcoin / Bitcoin'},
        {value: 'BITTREX:XLMBTC', label: 'Lumen / Bitcoin'},
        {value: 'BITTREX:XRPBTC', label: 'Ripple / Bitcoin'},

        // Misc
        {value: 'BITTREX:BTCUSDT', label: 'Bitcoin / Tether USD'},
        {value: 'BITTREX:ETHUSDT', label: 'Ethereum / Tether USD'},
        {value: 'BITTREX:SNTETH', label: 'Status Network Token / Ethereum'},
        {value: 'BITTREX:BCCUSDT', label: 'Bitcoin Cash / Tether USD'},
        {value: 'BITTREX:NEOUSDT', label: 'Neo / Tether'},
    ];

    constructor() {
        super(WIDGET_TRADINGVIEW, "TradingView Chart", DISABLE_AUTOMATIC_WRAPPING, "tradingView");
    }

    protected OnNewWidgetPrepared(widget: EditableWidget): void {
        widget.dimension.newData.interval = "D"; // 1 day
        widget.dimension.newData.pair = this.pairs[0].value;
    }

    protected OnWidgetBeforeAdd(widget: EditableWidget): void {
        this.setViewUrl(widget);
    }

    protected OnWidgetBeforeEdit(widget: EditableWidget) {
        this.setViewUrl(widget);
    }

    private setViewUrl(widget: EditableWidget) {
        const pair = this.pairs.find(p => p.value === widget.dimension.newData.pair);
        widget.dimension.newTitle = pair ? pair.label : null;
        widget.dimension.newUrl = window.location.origin + "/widgets/tradingview?pair=$pair&interval=$interval";
    }
}