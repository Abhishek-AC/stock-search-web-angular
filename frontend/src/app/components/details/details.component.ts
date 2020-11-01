import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { AutocompleteService } from 'src/app/services/autocomplete.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import * as Highcharts from "highcharts/highstock";
import { Options } from "highcharts";

import IndicatorsCore from "highcharts/indicators/indicators";
import vbp from "highcharts/indicators/volume-by-price";
import IndicatorZigzag from "highcharts/indicators/zigzag";

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
    ticker: string;
    stockNews: Object;
    summary: object;
    details: Object;
    isLoading: boolean = true;
    tickerInvalid: boolean = false;
    graphColor: string;
    quantity: number = 0;
    current_news: Object;
    twitter_text: string;
    watchlistPresent: boolean = false;
    workingModal;
    summaryTabCharts: number[][];
    smaVolume: number[][];
    smaOHLC: number[][];

    Highcharts: typeof Highcharts = Highcharts;

    chartOptionsSummaryChart: Options = {};
    chartOptionsSmaVolume: Options = {};
    constructor(private _activatedRouter: ActivatedRoute, private _http: AutocompleteService,
        private config: NgbModalConfig, private modalService: NgbModal) {
        IndicatorsCore(Highcharts);
        IndicatorZigzag(Highcharts);
        vbp(Highcharts);
        config.backdrop = 'static';
        config.keyboard = false;
    }
    
    ngOnInit(): void {
        this.ticker = this._activatedRouter.snapshot.paramMap.get('id');
        var testWatchList = JSON.parse(localStorage.getItem("Watchlist"));
        if (testWatchList != null && this.ticker in testWatchList)
            this.watchlistPresent = true;
        this._http.getAllDetails(this.ticker)
            .pipe(
                debounceTime(220)
            )
            .subscribe(
                data => {
                    if ('error' in data) {
                        this.tickerInvalid = true;
                        this.isLoading = false;
                    }
                    else {
                        this.details = data['details'];
                        this.summary = data['summary'];
                        this.stockNews = data['newsArticles'];
                        this.summaryTabCharts = data['summaryTabCharts'];
                        this.smaVolume = data['sma_volume'];
                        this.smaOHLC = data['sma_ohlc'];
                        this.graphColor = data['change'] >= 0 ? 'green' : 'red';
                        this.isLoading = false;
                        this.chartOptionsSummaryChart = {
                            rangeSelector: {
                                enabled: false
                            },
                            title: {
                                text: this.details["ticker"]
                            },
                            yAxis: {
                                labels: {
                                    align: 'left',
                                    x: -30
                                }
                            },
                            time: {
                                timezoneOffset: new Date(Date.now()).getTimezoneOffset()
                            },
                            navigator: {
                                series: {
                                    fillOpacity: 0.05,
                                    color: this.graphColor,
                                }
                            },
                            series: [
                                {
                                    type: 'zigzag',
                                    tooltip: {
                                        valueDecimals: 2
                                    },
                                    name: this.details["ticker"],
                                    data: this.summaryTabCharts,
                                    color: this.graphColor,
                                }
                            ]
                        }
                        this.chartOptionsSmaVolume = {
                            rangeSelector: {
                                selected: 2
                            },
                            title: {
                                text: this.details["ticker"] + ' Historical'
                            },
                            subtitle: {
                                text: 'With SMA and Volume by Price technical indicators'
                            },
                            yAxis: [{
                                startOnTick: false,
                                endOnTick: false,
                                labels: {
                                    align: 'right',
                                    x: -3
                                },
                                title: {
                                    text: 'OHLC'
                                },
                                height: '60%',
                                lineWidth: 2,
                                resize: {
                                    enabled: true
                                }
                            }, {
                                labels: {
                                    align: 'right',
                                    x: -3
                                },
                                title: {
                                    text: 'Volume'
                                },
                                top: '65%',
                                height: '35%',
                                offset: 0,
                                lineWidth: 2
                            }],

                            tooltip: {
                                split: true
                            },
                            series: [{
                                type: 'candlestick',
                                name: this.details["ticker"],
                                id: this.details["ticker"],
                                zIndex: 2,
                                data: this.smaOHLC
                            }, {
                                type: 'column',
                                name: 'Volume',
                                id: 'volume',
                                data: this.smaVolume,
                                yAxis: 1
                            }, {
                                type: 'vbp',
                                linkedTo: this.details["ticker"],
                                params: {
                                    volumeSeriesID: 'volume'
                                },
                                dataLabels: {
                                    enabled: false
                                },
                                zoneLines: {
                                    enabled: false
                                }
                            }, {
                                type: 'sma',
                                linkedTo: this.details["ticker"],
                                zIndex: 1,
                                marker: {
                                    enabled: false
                                }
                            }]
                        }
                    }
                }
            )
    }
    openModal(index, content) {
        this.current_news = this.stockNews[index];
        this.twitter_text = encodeURIComponent(this.current_news['title']) + '%20' + encodeURIComponent(this.current_news['url']);
        this.modalService.open(content);
    }
    openBuyModal(content) {
        this.workingModal = this.modalService.open(content);
    }
    buyStockFunc() {
        var portfolioData = JSON.parse(localStorage.getItem("Portfolio"));
        var stockPurchased: Object = {
            "companyName": this.details["name"],
            "totalAmountShares": parseFloat((this.quantity * this.details["last"]).toFixed(2)),
            "noOfStocks": this.quantity,
            "avgCostPerShare": this.details["last"]
        }
        if (portfolioData == null) {
            var stockPurchasedTemp: Object = {};
            stockPurchasedTemp[this.ticker] = stockPurchased;
            portfolioData = stockPurchasedTemp;
            localStorage.setItem("Portfolio", JSON.stringify(portfolioData));
        }
        else {
            portfolioData = JSON.parse(localStorage.getItem("Portfolio"));
            if (portfolioData.hasOwnProperty(this.ticker)) {
                var previousStockData = portfolioData[this.ticker];
                previousStockData["noOfStocks"] = parseFloat((previousStockData["noOfStocks"] + stockPurchased["noOfStocks"]).toFixed(2));
                previousStockData["totalAmountShares"] = parseFloat((previousStockData["totalAmountShares"] + stockPurchased["totalAmountShares"]).toFixed(2));
                previousStockData["avgCostPerShare"] = parseFloat((previousStockData["totalAmountShares"] / previousStockData["noOfStocks"]).toFixed(2));
                portfolioData[this.ticker] = previousStockData;
            }
            else {
                portfolioData[this.ticker] = stockPurchased;
            }
            localStorage.setItem("Portfolio", JSON.stringify(portfolioData));
        }
        this.quantity = 0;
        this.workingModal.close();
    }

    checkWatchlist(ticker) {
        var watchlistData = JSON.parse(localStorage.getItem("Watchlist"));
        if (watchlistData == null) {
            this.watchlistPresent = false;
            localStorage.setItem("Watchlist", JSON.stringify({}));
            return;
        }
        watchlistData = JSON.parse(localStorage.getItem("Watchlist"));

        if (watchlistData.hasOwnProperty(ticker)) {
            this.watchlistPresent = true;
            return;
        }
        else {
            this.watchlistPresent = false;
        }
    }
    onStarClick() {
        this.checkWatchlist(this.ticker);
        if (!this.watchlistPresent) {
            var watchlistData = JSON.parse(localStorage.getItem("Watchlist"));
            watchlistData[this.ticker] = this.details["name"];
            localStorage.setItem("Watchlist", JSON.stringify(watchlistData));
            this.watchlistPresent = true;
        }
        else {
            var watchlistData = JSON.parse(localStorage.getItem("Watchlist"));
            delete watchlistData[this.ticker];
            localStorage.setItem("Watchlist", JSON.stringify(watchlistData));
            this.watchlistPresent = false;
        }
    }
}
