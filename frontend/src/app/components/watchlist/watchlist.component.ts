import { Component, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { AutocompleteService } from 'src/app/services/autocomplete.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  
  constructor(private _http: AutocompleteService, private _router: Router) { }
  isLoading: boolean = true;
  watchlistLocalStorage: Object = {};
  watchlistKeys : string[];
  watchlistPriceData : Object = {};

  ngOnInit(): void {

    this.watchlistLocalStorage = JSON.parse(localStorage.getItem("Watchlist"));

    if (this.watchlistLocalStorage != null && Object.keys(this.watchlistLocalStorage).length!= 0)  {
      this.watchlistKeys = Object.keys(this.watchlistLocalStorage);
      // call the service
      this._http.getWatchlistData(this.watchlistKeys)
      .pipe(
        debounceTime(200))
        .subscribe(data => {
          if ("error" in data) {
            console.log('In error')
            this.isLoading = false;
          }
          else {
            this.watchlistPriceData = data;
            this.isLoading = false;
          }
        })
    }
    else {
      this.isLoading = false;
    }
  }

  removeTickerFromWatchList(ticker) {
    delete this.watchlistLocalStorage[ticker];
    localStorage.setItem("Watchlist", JSON.stringify(this.watchlistLocalStorage));
  }

  navigateToDetails(ticker) {
    console.log(ticker);
    this._router.navigate(['/details', ticker]);
  }
}
