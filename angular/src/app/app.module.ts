import { NgModule } from '@angular/core'; 
import { BrowserModule } from '@angular/platform-browser'; 
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module'; 
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component'; 
import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from './navbar/navbar.component';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { NewsComponent } from './news/news.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; 
import { HighchartsChartModule } from 'highcharts-angular';
import { SearchComponent } from './search/search.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { TransactionComponent } from './transaction/transaction.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChartComponent } from './chart/chart.component';

@NgModule({ 
	declarations: [ 
		AppComponent, NavbarComponent, SearchbarComponent, NewsComponent, SearchComponent, WatchlistComponent, PortfolioComponent, TransactionComponent, ChartComponent
	], 
	imports: [ 
		BrowserModule, 
		AppRoutingModule, 
		HttpClientModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule ,
    HighchartsChartModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {path: '', redirectTo: 'search/home', pathMatch: 'full'},
      {path: 'search/:symbol', component: SearchComponent},
      {path: 'watchlist', component: WatchlistComponent},
      {path: 'portfolio', component: PortfolioComponent}
    ]),
	], 
	providers: [], 
	bootstrap: [AppComponent] 
}) 
export class AppModule { }
