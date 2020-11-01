import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {
  apiURLAutoComplete: string = 'http://localhost:3000/api/autocomplete?q=';
  apiURLDetails: string = 'http://localhost:3000/api/details?ticker=';
  apiWatchlist: string = 'http://localhost:3000/api/watchlist?';

  constructor(private httpClient: HttpClient) { }

  getAutoCompleteResults(keyCharacter: string) {
    var response = this.httpClient.get(this.apiURLAutoComplete + keyCharacter)
    .pipe(
      debounceTime(400),
      map(
        (data: any) => {
          return (
            data != [] ? data as any[] : [{"error": "Invalid key"} as any]
          );
        }
      )
    );
    
    return response;
  }

  getAllDetails(ticker: string) {
    var response = this.httpClient.get(this.apiURLDetails + ticker)
    .pipe(
      debounceTime(400),
      map(
        (data: any) => {
          return (
            data.length != 0 ? data as any[] : [{"error": "Invalid key"} as any]
          );

        }
      )
    );
    return response;
  }
  getWatchlistData(tickers: string[]) {
    var quertyString = "";
    for (var i in tickers) {
      quertyString += "q=" + tickers[i] + "&";
    }
    quertyString = quertyString.slice(0, -1);
    var route = this.apiWatchlist + quertyString;
    var response = this.httpClient.get(route)
    .pipe(
      debounceTime(200),
      map(
        (data: any) => {
          return (
            data.length != 0 ? data as any[] : [{"error": "Invalid key"} as any]
          );

        }
      )
    );
    return response;
  }
}
