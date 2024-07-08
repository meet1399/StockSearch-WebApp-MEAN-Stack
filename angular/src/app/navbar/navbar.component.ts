import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilService } from '../util.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isSearchTabFlag: boolean = true;
  validDataPresent: boolean = false;

  searchSymbol: String = "home";

  constructor(
    private router: Router,
    private util: UtilService) { }

  ngOnInit(): void {
    this.util.validDataPresentSubject.subscribe(flag => {
      this.validDataPresent = flag;
      if (this.isSearchTabFlag) {
        this.setSearchTab();
      }
    });

    // update search symbol upon user search
    this.util.searchSymbolSubject.subscribe(symbol => {
      this.searchSymbol = symbol;
    });

    this.util.cardNavbarSwitchFlagSubject.subscribe(flag => {
      if (flag) {
        this.setSearchTab();
      }
      this.util.cardNavbarSwitchFlag = false;
    });

    this.util.setWatchlistTabSubject.subscribe(() => {
      this.setWatchlistTab();
    });

    this.util.setPortfolioTabSubject.subscribe(() => {
      this.setPortfolioTab();
    })
  }

  setSearchTab() {
    document.getElementById('watchlist')?.classList.remove('activated');
    document.getElementById('portfolio')?.classList.remove('activated');
    document.getElementById('search')?.classList.add('activated');
    this.isSearchTabFlag = true;
  }

  setWatchlistTab() {
    document.getElementById('search')?.classList.remove('activated');
    document.getElementById('watchlist')?.classList.add('activated');
    document.getElementById('portfolio')?.classList.remove('activated');
    this.isSearchTabFlag = false;
  }
  
  setPortfolioTab() {
    document.getElementById('search')?.classList.remove('activated');
    document.getElementById('watchlist')?.classList.remove('activated');
    document.getElementById('portfolio')?.classList.add('activated');
    this.isSearchTabFlag = false;
  }

}
