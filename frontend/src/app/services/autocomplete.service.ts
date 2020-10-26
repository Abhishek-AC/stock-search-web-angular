import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {
  apiURL: string = 'http://localhost:3000/api/autocomplete?q=';
  
  constructor(private httpClient: HttpClient) { }

  getAutoCompleteResults(keyCharacter: string) {
    var response = this.httpClient.get(this.apiURL + keyCharacter)
    .pipe(
      debounceTime(400),
      map(
        (data: any) => {
          return (
            data.length != 0 ? data.result as any[] : [{"error": "Invalid key"} as any]
          );
        }
      )
    );
    return response;
  }
}
