import { Component, OnInit } from '@angular/core';
import * as Highcharts from "highcharts/highstock";
import { Options } from "highcharts";

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;

  chartOptions: Options = {
    
    };

  constructor() { }

  ngOnInit(): void {
    this.chartOptions= { 
      series: [
      {
        type: "line",
        data: [1, 2, 3]
      }
    ]
  
  }
  }

}
