import { Injectable } from '@angular/core';
import { UtilService } from './util.service';
import axios from 'axios';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  profileDataReadySubject: Subject<boolean> = new Subject();
  latestDataReadySubject: Subject<boolean> = new Subject();
  newsDataReadySubject: Subject<boolean> = new Subject();
  recommendationDataReadySubject: Subject<boolean> = new Subject();
  socialSentimentDataReadySubject: Subject<boolean> = new Subject();
  peersDataReadySubject: Subject<boolean> = new Subject();
  earningsDataReadySubject: Subject<boolean> = new Subject();
  summaryChartReadySubject: Subject<boolean> = new Subject();
  historyChartReadySubject: Subject<boolean> = new Subject();
  // for watchlist & portfolio
  latestDataBySymbolReadySubject: Subject<string> = new Subject();

  constructor(
    private util: UtilService) { }

  getAllData() {
    this.getProfileData();
    this.getLatestData();
    this.getNewsData();
    this.getRecommendationData();
    this.getSocialSentimentData();
    this.getPeersData();
    this.getEarningsData();
    this.getHistoryChartData();
    this.getSummaryChartData();
  }

  getProfileData() {
    var url = "http://localhost:3000/api/profile/" + this.util.getSearchSymbol();
    axios.get(url).then(data => {
      var valid = data.data.ticker != null;
      window.localStorage.setItem('profile', JSON.stringify(data.data));
      this.profileDataReadySubject.next(valid);
    }).catch(() => {
      window.localStorage.setItem('profile', "");
      this.profileDataReadySubject.next(false);
    });
  }

  getLatestData() {
    var tnow = Date.now();
    var url = "http://localhost:3000/api/latest/" + this.util.getSearchSymbol();
    axios.get(url).then(data => {
      if (data.data.d != null) {
        data.data.c = data.data.c.toFixed(2);
        data.data.d = data.data.d.toFixed(2);
        data.data.dp = data.data.dp.toFixed(2);
        data.data.h = data.data.h.toFixed(2);
        data.data.l = data.data.l.toFixed(2);
        data.data.o = data.data.o.toFixed(2);
        data.data.pc = data.data.pc.toFixed(2);
      }
      if (data.data.t != null && data.data.t != 0) {
        var tret = parseInt(data.data.t) * 1000;
        data.data.diff = tnow - tret;
        if (tnow - tret < 300000) {
          // handle market open
          data.data.marketopen = true;
        } else {
          // handle market closed (data.data.t)
          data.data.marketopen = false;
        }
        window.localStorage.setItem('latest', JSON.stringify(data.data));
        this.latestDataReadySubject.next(true);
      }
    }).catch(() => {
      window.localStorage.setItem('latest', "");
      this.latestDataReadySubject.next(false);
    });
  }

  getNewsData() {
    var url = "http://localhost:3000/api/news/" + this.util.getSearchSymbol();
    axios.get(url).then(data => {
      window.localStorage.setItem('news', JSON.stringify(data.data));
      this.newsDataReadySubject.next(true);
    }).catch(() => {
      window.localStorage.setItem('news', "");
      this.newsDataReadySubject.next(false);
    });
  }

  getRecommendationData() {
    var url = "http://localhost:3000/api/recommendation/" + this.util.getSearchSymbol();
    axios.get(url).then(data => {
      window.localStorage.setItem('recommendation', JSON.stringify(data.data));
      this.recommendationDataReadySubject.next(true);
    }).catch(() => {
      window.localStorage.setItem('recommendation', "");
      this.recommendationDataReadySubject.next(false);
    });
  }

  getSocialSentimentData() {
    var url = "http://localhost:3000/api/insider/" + this.util.getSearchSymbol();
    axios.get(url).then(data => {
      window.localStorage.setItem('social', JSON.stringify(data.data));
      this.socialSentimentDataReadySubject.next(true);
    }).catch(() => {
      window.localStorage.setItem('social', "");
      this.socialSentimentDataReadySubject.next(false);
    });
  }

  getPeersData() {
    var url = "http://localhost:3000/api/peers/" + this.util.getSearchSymbol();
    axios.get(url).then(data => {
      window.localStorage.setItem('peers', JSON.stringify(data.data));
      this.peersDataReadySubject.next(true);
    }).catch(() => {
      window.localStorage.setItem('peers', "");
      this.peersDataReadySubject.next(false);
    });
  }

  getEarningsData() {
    var url = "http://localhost:3000/api/earnings/" + this.util.getSearchSymbol();
    axios.get(url).then(data => {
      window.localStorage.setItem('earnings', JSON.stringify(data.data));
      this.earningsDataReadySubject.next(true);
    }).catch(() => {
      window.localStorage.setItem('earnings', "");
      this.earningsDataReadySubject.next(false);
    });
  }

  getSummaryChartData() {
    var data = JSON.parse(window.localStorage.getItem('latest') || "");
    const currentDate = new Date(data.t*1000);
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const previousDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));
    const previousDateStr = previousDate.toISOString().split('T')[0];
    var url = "http://localhost:3000/api/candle/hour/" + this.util.getSearchSymbol() + "/" + currentDateStr + "/" + previousDateStr;
    axios.get(url).then(data => {
      window.localStorage.setItem('summaryChart', JSON.stringify(data.data));
      this.summaryChartReadySubject.next(true);
    }).catch(() => {
      window.localStorage.setItem('summaryChart', "");
      this.summaryChartReadySubject.next(false);
    });
  }

  getHistoryChartData() {
    var url = "http://localhost:3000/api/candle/year/" + this.util.getSearchSymbol();
    axios.get(url).then(data => {
      window.localStorage.setItem('historyChart', JSON.stringify(data.data));
      this.historyChartReadySubject.next(true);
    }).catch(() => {
      window.localStorage.setItem('historyChart', "");
      this.historyChartReadySubject.next(false);
    });
  }

  // for watchlist & portfolio ONLY
  getLatestDataBySymbol(symbol: string) {
    var url = "http://localhost:3000/api/latest/" + symbol;
    axios.get(url).then(data => {
      if (data.data.d != null) {
        data.data.c = data.data.c.toFixed(2);
        data.data.d = data.data.d.toFixed(2);
        data.data.dp = data.data.dp.toFixed(2);
        data.data.h = data.data.h.toFixed(2);
        data.data.l = data.data.l.toFixed(2);
        data.data.o = data.data.o.toFixed(2);
        data.data.pc = data.data.pc.toFixed(2);
      }
      data.data.symbol = symbol;
      this.latestDataBySymbolReadySubject.next(JSON.stringify(data.data));
    }).catch(() => {
        this.latestDataBySymbolReadySubject.next("");
    });
  }
}
