import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilService } from '../util.service';
import { DataService } from '../data.service';
import { WatchlistService } from '../watchlist.service';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {

  watchlistEmptyAlert: boolean = true;
  watchlistObject: any;
  watchlist: any[] = [];

  constructor(
    private router: Router,
    private util: UtilService,
    private dataService: DataService,
    private watchlistService: WatchlistService
  ) {
  }


  onCardClick(symbol: string) {
    this.util.setSearchSymbol(symbol);
    this.util.setCardSwitchFlag(true);
    this.util.setNavbarCardSwitchFlag(true);
    this.router.navigateByUrl('/search/'+symbol);
  }

  onRemoveButtonClick(ticker: string) {
    this.watchlistService.removeFromWatchlist(ticker);
    this.watchlist.forEach((item, index) => {
      if (item.ticker == ticker) {
        this.watchlist.splice(index, 1);
      }
    });
    this.watchlistEmptyAlert = this.watchlist.length == 0;
  }

  async ngOnInit(): Promise<void> {
    this.watchlistEmptyAlert = true;
    this.watchlistObject = await this.watchlistService.getWatchlistObject();
    for (var k in this.watchlistObject) {
      var item = this.watchlistObject[k];
      this.watchlist.push(item);
      this.dataService.getLatestDataBySymbol(item.ticker);
    }
    this.watchlistEmptyAlert = this.watchlist.length == 0;
    this.util.setWatchlistTab();
    this.dataService.latestDataBySymbolReadySubject.subscribe(data => {
      if (data == null || data == '') {
        return;
      }
      var dataobj = JSON.parse(data);
      for (var i = 0; i < this.watchlist.length; i++) {
        if (dataobj.symbol == this.watchlist[i].ticker) {
          this.watchlist[i].c = dataobj.c;
          this.watchlist[i].d = dataobj.d;
          this.watchlist[i].dp = dataobj.dp;
          if (Number(dataobj.dp) < 0) {
            this.watchlist[i].color = "text-danger";
          } else {
            this.watchlist[i].color = "text-success";
          }
        }
      }
    })
  }

}
