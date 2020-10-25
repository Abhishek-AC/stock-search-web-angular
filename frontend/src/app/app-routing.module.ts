import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PortfolioComponent } from './components/portfolio/portfolio.component'
import { WatchlistComponent } from './components/watchlist/watchlist.component'
import { SearchComponent } from './components/search/search.component';

const routes: Routes = [
  { path: '', component: SearchComponent } ,
  { path: 'portfolio', component: PortfolioComponent } ,
  { path: 'watchlist', component: WatchlistComponent }             
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
