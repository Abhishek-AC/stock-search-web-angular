import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, tap } from 'rxjs/operators';
import { AutocompleteService } from 'src/app/services/autocomplete.service';
import { Router } from '@angular/router';

export interface AutoComplete {
  name: string;
  ticker: string;
}


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class SearchComponent implements OnInit {

  stateCtrl = new FormControl();
  filteredStates: Observable<AutoComplete[]>;
  enteredTicker: string;

  autoComplete : Object;
  isLoading = false;

  constructor(private _http: AutocompleteService, private _router: Router) {}
  
  autoCompletes: AutoComplete[] = [
  ];

  ngOnInit() {
    this.stateCtrl.valueChanges
    .pipe(
      debounceTime(250),
      distinctUntilChanged(),
      tap(() => this.isLoading = true)
    )
    .subscribe(ticker => {
      if (ticker != "") {
        this._http.getAutoCompleteResults(ticker).subscribe((data) => {
          this.autoComplete = data as any[];
          this.isLoading = false;
        })
      }
      else {
        this.autoComplete = []
        this.isLoading = false;
      }
    })
  
    this.filteredStates = this.stateCtrl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value: value.name),
        map(name => name ? this._filterStates(name) : this.autoCompletes.slice())
      );
  }
  displayFn(autoComplete: AutoComplete): string {
    return autoComplete && autoComplete.ticker ? autoComplete.ticker : '';
  }
  private _filterStates(value: string): AutoComplete[] {
    const filterValue = value.toLowerCase();

    return this.autoCompletes.filter(state => state.name.toLowerCase().indexOf(filterValue) === 0);
  }

  getDetails() {
    if (this.stateCtrl.value == null) 
      return;
    
    this.enteredTicker = this.stateCtrl.value.ticker;
    if (this.enteredTicker == undefined) {
      return;
    } 
    this._router.navigate(['/details', this.enteredTicker])
  }
}
