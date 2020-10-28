import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { AutocompleteService } from 'src/app/services/autocomplete.service';

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

    Highcharts: typeof Highcharts = Highcharts;

    chartOptionsSummaryChart: Options = {};
    chartOptionsSmaVolume: Options = {};
    constructor(private _activatedRouter: ActivatedRoute, private _http: AutocompleteService) {
        IndicatorsCore(Highcharts);
        IndicatorZigzag(Highcharts);
        vbp(Highcharts);
    }
    summaryTabCharts: number[][];
    smaVolume: number[][];
    smaOHLC: number[][];

    ngOnInit(): void {
        this.ticker = this._activatedRouter.snapshot.paramMap.get('id');
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
}
