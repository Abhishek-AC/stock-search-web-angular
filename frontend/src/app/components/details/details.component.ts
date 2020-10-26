import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  ticker: string;
  constructor(private _activatedRouter: ActivatedRoute) { }

  ngOnInit(): void {
    this.ticker = this._activatedRouter.snapshot.paramMap.get('id');
    console.log(this.ticker);
  }

}
