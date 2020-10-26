import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {
  apiURL: string = 'http://localhost:3000/api/autocomplete';
  
  constructor(private httpClient: HttpClient) { }

  getAutoCompleteResults() {
    
  }

}
