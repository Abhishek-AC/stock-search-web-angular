import { Component, OnInit } from '@angular/core';
import { AutocompleteService } from 'src/app/services/autocomplete.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router'

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  isLoading: boolean = true;
  portfolioLocalElements: any;
  portfolioServerData: any;
  portfolioElementsToDisplay: Object[] = [];
  currentStock: Object;
  workingModal;
  currentStockIndex: number;
  stockQuantity: number = 0;
  showAlert : boolean = true;

  constructor(private _http: AutocompleteService, private config: NgbModalConfig, private modalService: NgbModal, private _router: Router) { }

  ngOnInit(): void {
    this.portfolioLocalElements = JSON.parse(localStorage.getItem("Portfolio"));

    if (this.portfolioLocalElements != null && Object.keys(this.portfolioLocalElements).length != 0) {
      this.showAlert = false;
      var tickers_list = Object.keys(this.portfolioLocalElements);
      this._http.getWatchlistData(tickers_list)
        .pipe(
          debounceTime(200))
        .subscribe(data => {
          if ("error" in data) {
            console.log('In error');
            this.isLoading = false;
          }
          else {
            this.portfolioServerData = data;
            for (var i = 0; i < tickers_list.length; i++) {
              var portfolio: Object = {};
              portfolio['ticker'] = tickers_list[i];
              portfolio['companyName'] = this.portfolioLocalElements[tickers_list[i]]['companyName'];
              portfolio['quantity'] = this.portfolioLocalElements[tickers_list[i]]['noOfStocks'];
              portfolio['avgCost'] = this.portfolioLocalElements[tickers_list[i]]['avgCostPerShare'];
              portfolio['totalCost'] = this.portfolioLocalElements[tickers_list[i]]['totalAmountShares'];
              portfolio['currentPrice'] = this.portfolioServerData[tickers_list[i]]['last'];
              portfolio['change'] = parseFloat((portfolio['currentPrice'] - portfolio['avgCost']).toFixed(2));
              portfolio['marketValue'] = parseFloat((portfolio['quantity'] * this.portfolioServerData[tickers_list[i]]['last']).toFixed(2));
              portfolio['last'] = this.portfolioServerData[tickers_list[i]]['last'];
              this.portfolioElementsToDisplay.push(portfolio);
            }
            this.isLoading = false;
          }
        })
    }
    else {
      this.showAlert = true;
      this.isLoading = false;
    }
  }
  navigate_details(ticker) {
    this._router.navigate(['/details', ticker]);
  }

  openBuyModal(index, content) {
    this.stockQuantity = 0;
    this.currentStockIndex = index;
    this.workingModal = this.modalService.open(content);
  }

  buyStockFunc() {
    var portfolioData = JSON.parse(localStorage.getItem("Portfolio"));
    var stockPurchased: Object = {
      "companyName": this.portfolioElementsToDisplay[this.currentStockIndex]["companyName"],
      "totalAmountShares": parseFloat((this.stockQuantity * this.portfolioElementsToDisplay[this.currentStockIndex]["last"]).toFixed(2)),
      "noOfStocks": this.stockQuantity,
      "avgCostPerShare": this.portfolioElementsToDisplay[this.currentStockIndex]["last"]
    }
    if (portfolioData == null) {
      var stockPurchasedTemp: Object = {};
      stockPurchasedTemp[this.portfolioElementsToDisplay[this.currentStockIndex]['ticker']] = stockPurchased;
      portfolioData = stockPurchasedTemp;
      localStorage.setItem("Portfolio", JSON.stringify(portfolioData));
    }
    else {
      if (portfolioData.hasOwnProperty(this.portfolioElementsToDisplay[this.currentStockIndex]['ticker'])) {
        var previousStockData = portfolioData[this.portfolioElementsToDisplay[this.currentStockIndex]['ticker']];
        previousStockData["noOfStocks"] = parseFloat((previousStockData["noOfStocks"] + stockPurchased["noOfStocks"]).toFixed(2));
        previousStockData["totalAmountShares"] = parseFloat((previousStockData["totalAmountShares"] + stockPurchased["totalAmountShares"]).toFixed(2));
        previousStockData["avgCostPerShare"] = parseFloat((previousStockData["totalAmountShares"] / previousStockData["noOfStocks"]).toFixed(2));
        portfolioData[this.portfolioElementsToDisplay[this.currentStockIndex]['ticker']] = previousStockData;
      }
      else {
        portfolioData[this.portfolioElementsToDisplay[this.currentStockIndex]['ticker']] = stockPurchased;
      }
      localStorage.setItem("Portfolio", JSON.stringify(portfolioData));
    }

    this.stockQuantity = 0;
    var currentPortfolioData = JSON.parse(localStorage.getItem("Portfolio"));
    currentPortfolioData = currentPortfolioData[this.portfolioElementsToDisplay[this.currentStockIndex]['ticker']];
    this.portfolioElementsToDisplay[this.currentStockIndex]['quantity'] = currentPortfolioData['noOfStocks'];
    this.portfolioElementsToDisplay[this.currentStockIndex]['avgCost'] = currentPortfolioData['avgCostPerShare'];
    this.portfolioElementsToDisplay[this.currentStockIndex]['totalCost'] = currentPortfolioData['totalAmountShares'];
    this.portfolioElementsToDisplay[this.currentStockIndex]['marketValue'] = parseFloat((currentPortfolioData['noOfStocks'] * this.portfolioElementsToDisplay[this.currentStockIndex]['last']).toFixed(2));

    this.workingModal.close();
  }

  openSellModal(index, content) {
    this.stockQuantity = 0;
    this.currentStockIndex = index;
    this.workingModal = this.modalService.open(content);
  }

  sellStockFunc() {

    var portfolioData = JSON.parse(localStorage.getItem("Portfolio"));

    var stockPurchased: Object = {
      "companyName": this.portfolioElementsToDisplay[this.currentStockIndex]["companyName"],
      "totalAmountShares": parseFloat((this.stockQuantity * this.portfolioElementsToDisplay[this.currentStockIndex]["last"]).toFixed(2)),
      "noOfStocks": this.stockQuantity,
      "avgCostPerShare": this.portfolioElementsToDisplay[this.currentStockIndex]["last"]
    }

    if (portfolioData == null) {
      var stockPurchasedTemp: Object = {};
      stockPurchasedTemp[this.portfolioElementsToDisplay[this.currentStockIndex]['ticker']] = stockPurchased;
      portfolioData = stockPurchasedTemp;
      localStorage.setItem("Portfolio", JSON.stringify(portfolioData));
    }
    else {
      if (portfolioData.hasOwnProperty(this.portfolioElementsToDisplay[this.currentStockIndex]['ticker'])) {
        var previousStockData = portfolioData[this.portfolioElementsToDisplay[this.currentStockIndex]['ticker']];
        previousStockData["noOfStocks"] = parseFloat((previousStockData["noOfStocks"] - stockPurchased["noOfStocks"]).toFixed(2));
        previousStockData["totalAmountShares"] = parseFloat((previousStockData["totalAmountShares"] - stockPurchased["totalAmountShares"]).toFixed(2));
        previousStockData["avgCostPerShare"] = parseFloat((previousStockData["totalAmountShares"] / previousStockData["noOfStocks"]).toFixed(2));
        portfolioData[this.portfolioElementsToDisplay[this.currentStockIndex]['ticker']] = previousStockData;
      }
      else {
        portfolioData[this.portfolioElementsToDisplay[this.currentStockIndex]['ticker']] = stockPurchased;
      }
      localStorage.setItem("Portfolio", JSON.stringify(portfolioData));
    }
    this.stockQuantity = 0;

    var currentPortfolioData = JSON.parse(localStorage.getItem("Portfolio"));
    var currentQuantity = currentPortfolioData[this.portfolioElementsToDisplay[this.currentStockIndex]['ticker']]['noOfStocks'];
    if (currentQuantity == 0) {
      delete currentPortfolioData[this.portfolioElementsToDisplay[this.currentStockIndex]['ticker']];
      console.log(currentPortfolioData);
      localStorage.setItem("Portfolio", JSON.stringify(currentPortfolioData));
      this.portfolioElementsToDisplay.splice(this.currentStockIndex, 1);
    }
    else {
      currentPortfolioData = currentPortfolioData[this.portfolioElementsToDisplay[this.currentStockIndex]['ticker']];
      this.portfolioElementsToDisplay[this.currentStockIndex]['quantity'] = currentPortfolioData['noOfStocks'];
      this.portfolioElementsToDisplay[this.currentStockIndex]['avgCost'] = currentPortfolioData['avgCostPerShare'];
      this.portfolioElementsToDisplay[this.currentStockIndex]['totalCost'] = currentPortfolioData['totalAmountShares'];
      this.portfolioElementsToDisplay[this.currentStockIndex]['marketValue'] = parseFloat((currentPortfolioData['noOfStocks'] * this.portfolioElementsToDisplay[this.currentStockIndex]['last']).toFixed(2));
    }

    if(Object.keys(JSON.parse(localStorage.getItem("Portfolio"))).length == 0){
      this.showAlert = true;
    }
    else {
      this.showAlert = false;
    }

    this.workingModal.close();
  }
}
