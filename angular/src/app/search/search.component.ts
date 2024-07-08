import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, timer } from 'rxjs';
import moment from 'moment';

import * as Highcharts from 'highcharts';
import moment_timezone from 'moment-timezone';

import { UtilService } from '../util.service';
import { DataService } from '../data.service';
import { WatchlistService } from '../watchlist.service';
import { TransactionService } from '../transaction.service';
import { NewsComponent } from '../news/news.component';
import { TransactionComponent } from '../transaction/transaction.component';


window.moment = moment;
moment_timezone();

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy, AfterViewInit {
  inputText: String = "";
  noInputFlag: boolean = false;
  validSymbolFlag: boolean = false;
  invalidSymbolFlag: boolean = false;
  loadingFlag: boolean = false;
  clearFlag: boolean = false; // used by onNotify method only!

  // data loading flags
  profileLoadedFlag: boolean = false;
  latestLoadedFlag: boolean = false;
  newsLoadedFlag: boolean = false;
  recommendationLoadedFlag: boolean = false;
  socialSentimentLoadedFlag: boolean = false;
  peersLoadedFlag: boolean = false;
  earningsLoadedFlag: boolean = false;
  summaryChartLoadedFlag: boolean = false;
  historyChartLoadedFlag: boolean = false;

  historyChartReadyFlag: boolean = false;

  // watchlist & portfolio flags
  watchlistActivateFlag: boolean = false;
  watchlistAddFlag: boolean = false;
  watchlistRemoveFlag: boolean = false;
  buyAlertFlag: boolean = false;
  sellAlertFlag: boolean = false;
  stockHoldingFlag: boolean = false;

  // data element
  @ViewChild('reservedElement', {static: false}) reservedElement!: ElementRef;
  @ViewChild('displayElement', {static: false}) displayElement!: ElementRef;
  latestObject: Object = {};
  testText3: String = "";
  testText4: String = "";
  ticker: string = "";
  name: string = "";
  exchange: String = "";
  ipo: String = "";
  industry: String = "";
  weburl: String = "";
  peers: String = "";
  @ViewChild('logo') logo!: ElementRef;
  c: String = "";
  d: String = "";
  dp: String = "";
  h: String = "";
  l: String = "";
  o: String = "";
  pc: String = "";
  t: String = "";
  @ViewChild('searchPrice') searchPrice!: ElementRef;
  priceUp: boolean = true;
  @ViewChild('marketStatus') marketStatus!: ElementRef;
  formatedQueryTime: String = "";
  @ViewChild('weblink') weblink!: ElementRef;
  @ViewChild('peerlist') peerlist!: ElementRef;
  @ViewChild('newslist') newslist!: ElementRef;
  newscache: any = [];
  insiderSymbol: string = "";
  msprTotal: string = "";
  msprPositive: string = "";
  msprNegative: string = "";
  changeTotal: String = "";
  changePositive: string = "";
  changeNegative: string = "";

  // Highcharts
  highcharts: typeof Highcharts = Highcharts;
  summaryChartOptions: Highcharts.Options = {
    series: [
      {
        data: [],
        type: 'line'
      }
    ]
  };
  recommendationChartOptions: Highcharts.Options = {
    chart: {
      type: 'column'
    },
    plotOptions: {
      column: {
        stacking: 'normal'
      }
    },
    series: [
      {
        type: 'column',
        name: 'Strong Buy',
        data: [],
        color: '#18632f'
      },
      {
        type: 'column',
        name: 'Buy',
        data: [],
        color: '#19b049'
      },
      {
        type: 'column',
        name: 'Hold',
        data: [],
        color: '#af7f1b'
      },
      {
        type: 'column',
        name: 'Sell',
        data: [],
        color: '#f15050'
      },
      {
        type: 'column',
        name: 'Strong Sell',
        data: [],
        color: '#742c2e'
      },
    ]
  }
  earningsChartOptions: Highcharts.Options = {
    title: {
      text: "Historical EPS Surprises"
    },
    tooltip: {
      shared: true,
    },
    series: [
      {
        data: [],
        type: 'spline'
      },
      {
        data: [],
        type: 'spline'
      }
    ]
  };
  

  intervalSubscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private util: UtilService,
    private dataService: DataService,
    private watchlistService: WatchlistService,
    private transactionService: TransactionService,
    private renderer: Renderer2,
    private modalService: NgbModal,
    private cd: ChangeDetectorRef) { 
      this.highcharts.setOptions({
        time: {
          timezone: 'America/Los_Angeles'
        }
      });
    }

  // called only when switch from /watchlist or /portfolio
  ngOnInit(): void {
    // initialize timer for periodic update
    const updateTimer = timer(1000, 15000);
    this.intervalSubscription = updateTimer.subscribe(() => {
      if (this.validSymbolFlag) {
        // TODO: do periodic update
        this.dataService.getLatestData();
      }
    });

    // subscribe to setValidDataPresentFlag & services that updates data
    this.util.validDataPresentSubject.subscribe(isValid => {
      this.loadingFlag = false;
      if (this.noInputFlag == true) {
        // do nothing
      } else if (isValid) {
        this.validSymbolFlag = true;
        this.invalidSymbolFlag = false;
        setTimeout(() => { this.presentAll(); });
      } else {
        this.validSymbolFlag = false;
        this.invalidSymbolFlag = true;
        this.util.setSearchSymbol('home');
      }
    });

    // subscribe for data load completion from DataService, call present functions
    this.dataService.profileDataReadySubject.subscribe(success => {
      if (success) {
        this.profileLoadedFlag = true;
        //this.util.setValidDataPresentFlag(true);
        //this.presentProfile();
        this.checkDataLoadFlags();
      } else {
        this.util.setValidDataPresentFlag(false);
      }
    });

    this.dataService.latestDataReadySubject.subscribe(() => {
      if (!this.validSymbolFlag) {
        this.latestLoadedFlag = true;
        this.checkDataLoadFlags();
      } else {
        this.presentLatest();
      }
    });

    this.dataService.newsDataReadySubject.subscribe(() => {
      this.newsLoadedFlag = true;
      this.checkDataLoadFlags();
    });

    this.dataService.recommendationDataReadySubject.subscribe(() => {
      this.recommendationLoadedFlag = true;
      this.checkDataLoadFlags();
    });

    this.dataService.socialSentimentDataReadySubject.subscribe(() => {
      this.socialSentimentLoadedFlag = true;
      this.checkDataLoadFlags();
    });

    this.dataService.peersDataReadySubject.subscribe(() => {
      this.peersLoadedFlag = true;
      this.checkDataLoadFlags();
    });

    this.dataService.earningsDataReadySubject.subscribe(() => {
      this.earningsLoadedFlag = true;
      this.checkDataLoadFlags();
    });

    this.dataService.summaryChartReadySubject.subscribe(() => {
      if (!this.validSymbolFlag) {
        this.summaryChartLoadedFlag = true;
        this.checkDataLoadFlags();
      } else {
        this.presentSummaryChart();
      }
    });

    this.dataService.historyChartReadySubject.subscribe(() => {
      this.historyChartLoadedFlag = true;
      this.checkDataLoadFlags();
    });
  }

  ngOnDestroy(): void {
    this.intervalSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    // TODO: try to distinguish user-input-url search and back-to-home routing here.
    if (routeParams.get('symbol') != null) {
      this.inputText = String(routeParams.get('symbol'));
      if (this.inputText != this.util.getSearchSymbol() || this.util.cardSwitchFlag) {
        // should reload here!
        this.stockHoldingFlag = false;
        this.util.cardSwitchFlag = false;
        this.util.setSearchInput(this.inputText.trim().toUpperCase());
        this.handleSearch();
      }
    } else {
      this.inputText = this.util.getSearchSymbol();
    }
    if (this.util.getValidDataPresentFlag()) {
      // load cached data!
      this.validSymbolFlag = true;
      setTimeout(() => { this.presentAll(); });
    }
  }

  onNotify() {
    if (this.util.getClearContentFlag()) {
      this.noInputFlag = false;
      this.validSymbolFlag = false;
      this.invalidSymbolFlag = false;
      this.resetDataLoadFlags();
      this.resetAlertFlags();
      this.util.setClearContentFlag(false);
      this.stockHoldingFlag = false;
      //this.util.setValidDataPresentFlag(false);
    } else {
      this.handleSearch();
    }
  }

  handleSearch() {
    this.resetDataLoadFlags();
    this.inputText = this.util.getSearchInput();
    this.resetAlertFlags();
    this.stockHoldingFlag = false;
    if (this.inputText == null || !this.validateSearchInput(this.inputText)) {
      this.validSymbolFlag = false;
      this.invalidSymbolFlag = false;
      this.noInputFlag = true;
      this.util.setValidDataPresentFlag(false);
      this.util.setSearchSymbol('home');
    } else {
      this.noInputFlag = false;
      this.router.navigateByUrl('/search/'+this.inputText);
      var realInputText = this.inputText.trim().toUpperCase();
      this.util.setSearchSymbol(realInputText);
      this.resetAlertFlags();
      this.loadingFlag = true;
      this.validSymbolFlag = false;
      this.invalidSymbolFlag = false;
      this.dataService.getAllData();
    }
  }

  validateSearchInput(inputText: String) {
    var input = inputText.trim().toUpperCase();
    if (input.length == 0) {
      return false;
    }
    const re = /^[a-z0-9]+$/i;
    return re.test(input);
  }

  handlePeerSearch(name: String) {
    this.util.setSearchInput(name);
    this.handleSearch();
  }

  closeNoInputAlert() {
    this.noInputFlag = false;
  }

  // called only when loading cached data
  presentAll() {
    // first page
    this.presentProfile();
    this.presentLatest();
    this.presentSummaryChart();
    // other pages
    this.presentNews();
    this.presentRecommendation();
    this.presentSocialSentiment();
    this.presentPeers();
    this.presentEarnings();
    this.presentHistoryChart();
  }

  // present data fetched from API
  async presentProfile() {
    var data = JSON.parse(window.localStorage.getItem('profile') || "");
    this.ticker = data.ticker;
    this.watchlistActivateFlag = await this.watchlistService.isTickerInWatchlist(this.ticker);
    this.name = data.name;
    this.exchange = data.exchange;
    this.logo.nativeElement.src = data.logo;
    if (data.logo == null || data.logo == '') {
      this.logo.nativeElement.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    }
    this.ipo = data.ipo;
    this.industry = data.finnhubIndustry;
    this.weburl = data.weburl;
    this.weblink.nativeElement.href = data.weburl;
    this.stockHoldingFlag = await this.transactionService.isHoldingStock(this.ticker);
  }

  presentLatest() {
    var data = JSON.parse(window.localStorage.getItem('latest') || "");
    this.latestObject = data;
    this.c = String(data.c);
    this.d = String(data.d);
    this.dp = String(data.dp);
    this.h = String(data.h);
    this.l = String(data.l);
    this.o = String(data.o);
    this.pc = String(data.pc);
    if (data.dp >= 0) {
      this.priceUp = true;
      this.searchPrice.nativeElement.classList.remove("text-danger");
      this.searchPrice.nativeElement.classList.add("text-success");
    } else {
      this.priceUp = false;
      this.searchPrice.nativeElement.classList.remove("text-success");
      this.searchPrice.nativeElement.classList.add("text-danger");
    }
    var latestTime = new Date(data.t * 1000);
    var queryTime = new Date(data.t * 1000 + data.diff);
    var formatedLatestTime = moment(latestTime).format('YYYY-MM-DD HH:mm:ss');
    this.formatedQueryTime = moment(queryTime).format('YYYY-MM-DD HH:mm:ss');
    if (data.marketopen) {
      this.marketStatus.nativeElement.classList.remove("text-danger");
      this.marketStatus.nativeElement.classList.add("text-success");
      this.marketStatus.nativeElement.innerHTML = "Market Open";
    } else {
      this.marketStatus.nativeElement.classList.remove("text-seccess");
      this.marketStatus.nativeElement.classList.add("text-danger");
      this.marketStatus.nativeElement.innerHTML = "Market Closed on " + formatedLatestTime;
    }
  }

  presentNews() {
    var data = JSON.parse(window.localStorage.getItem('news') || "");
    for (var i = 0; i < data.length; i++) {
      this.newscache[i] = data[i];
      let newsElement = this.renderer.createElement('div');
      let newsCard = this.renderer.createElement('mat-card');
      let newsImg = this.renderer.createElement('img');
      let newsText = this.renderer.createElement('div');
      this.renderer.addClass(newsElement, 'col-md');
      this.renderer.addClass(newsElement, 'mt-3');
      this.renderer.addClass(newsElement, 'news-card');
      this.renderer.addClass(newsCard, 'mat-card');
      this.renderer.addClass(newsCard, 'mat-focus-indicator');
      this.renderer.addClass(newsImg, 'news-img');
      this.renderer.addClass(newsText, 'news-text');
      this.renderer.setAttribute(newsCard, 'newsId', String(i));
      this.renderer.setAttribute(newsImg, 'newsId', String(i));
      this.renderer.setAttribute(newsText, 'newsId', String(i));
      this.renderer.setAttribute(newsImg, 'src', data[i].image);
      this.renderer.setProperty(newsText, 'innerHTML', data[i].headline);
      this.renderer.listen(newsCard, 'click', evt => {
        var nid = (<HTMLElement>evt.target!).getAttribute('newsId');
        let newsData = this.newscache[Number(nid)];
        let modalRef = this.modalService.open(NewsComponent);
        let date = new Date(newsData.datetime * 1000);
        modalRef.componentInstance.source = newsData.source;
        modalRef.componentInstance.date = moment(date).format('MMMM Do, YYYY');
        modalRef.componentInstance.title = newsData.headline;
        modalRef.componentInstance.description = newsData.summary;
        modalRef.componentInstance.url = newsData.url;
      });
      this.renderer.appendChild(newsCard, newsImg);
      this.renderer.appendChild(newsCard, newsText);
      this.renderer.appendChild(newsElement, newsCard);
      this.renderer.appendChild(this.newslist.nativeElement, newsElement);
      if (i % 2 != 0) {
        let rowDivider = this.renderer.createElement('div');
        this.renderer.addClass(rowDivider, 'w-100');
        this.renderer.appendChild(this.newslist.nativeElement, rowDivider);
      }
    }
    // add a dummy div if the number of news feed is odd
    if (data.length % 2 != 0) {
      let dummyElement = this.renderer.createElement('div');
      this.renderer.addClass(dummyElement, 'col-md');
      this.renderer.addClass(dummyElement, 'mt-3');
      this.renderer.appendChild(this.newslist.nativeElement, dummyElement);
    }
  }

  presentRecommendation() {
    var data = JSON.parse(window.localStorage.getItem('recommendation') || "");
    var xCategories = [];
    var xStrongBuy = [];
    var xBuy = [];
    var xHold = [];
    var xSell = [];
    var xStrongSell = [];
    for (var i = 0; i < data.length; i++) {
      xCategories.push(data[i].period);
      xStrongBuy.push(data[i].strongBuy);
      xBuy.push(data[i].buy);
      xHold.push(data[i].hold);
      xSell.push(data[i].sell);
      xStrongSell.push(data[i].strongSell);
    }
    this.recommendationChartOptions = {
      title: {
        text: "Recommendation Trends"
      },
      chart: {
        type: 'column',
        backgroundColor: '#F0F0F0'
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: xCategories
      },
      yAxis: {
        min: 0,
        title: {
          text: '#Analysis'
        },
        stackLabels: {
          enabled: false,
          style: {
            fontWeight: 'bold'
          }
        }
      },
      tooltip: {
        headerFormat: "<b>{point.x}</b><br/>",
        pointFormat: "{series.name}:{point.y}<br/>Total: {point.stackTotal}",
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true
          }
        }
      },
      series: [
        {
          type: 'column',
          name: 'Strong Buy',
          data: xStrongBuy,
          color: '#18632f'
        },
        {
          type: 'column',
          name: 'Buy',
          data: xBuy,
          color: '#19b049'
        },
        {
          type: 'column',
          name: 'Hold',
          data: xHold,
          color: '#af7f1b'
        },
        {
          type: 'column',
          name: 'Sell',
          data: xSell,
          color: '#f15050'
        },
        {
          type: 'column',
          name: 'Strong Sell',
          data: xStrongSell,
          color: '#742c2e'
        },
      ]
    };
    
  }

  presentSocialSentiment() {
    var data = JSON.parse(window.localStorage.getItem('social') || "");
    this.insiderSymbol = String(data.symbol);
    this.msprTotal = String(Math.round((data.mspr.positiveMspr + data.mspr.negativeMspr) * 100) / 100 );
    this.msprPositive = String(Math.round(data.mspr.positiveMspr * 100) / 100);
    this.msprNegative = String(Math.round(data.mspr.negativeMspr * 100) / 100);
    this.changeTotal = String(Math.round((data.change.positiveChange + data.change.negativeChange) * 100) / 100);
    this.changePositive = String(Math.round(data.change.positiveChange * 100) / 100);
    this.changeNegative = String(Math.round(data.change.negativeChange * 100) / 100);
  }

  presentPeers() {
    var data = JSON.parse(window.localStorage.getItem('peers') || "");
    this.peers =data.join(', ');
    this.peers = String(data.length);
    while (this.peerlist.nativeElement.firstChild) {
      this.peerlist.nativeElement.removeChild(this.peerlist.nativeElement.firstChild);
    }
    for (var i = 0; i < data.length; i++) {
      if (i != 0) {
        let comma = document.createElement("span");
        comma.innerHTML = ", ";
        this.peerlist.nativeElement.appendChild(comma);
      }
      let peer = document.createElement("a");
      peer.innerHTML = data[i];
      peer.href = "javascript:void(0);";
      peer.onclick = () => {
        this.handlePeerSearch(peer.innerHTML);
      }
      this.peerlist.nativeElement.appendChild(peer);
    }
  }

  presentEarnings() {
    var data = JSON.parse(window.localStorage.getItem('earnings') || "");
    var xCategories = [];
    var xActual = [];
    var xEstimate = [];
    for (var i = 0; i < data.length; i++) {
      xCategories.push(data[i].period + "<br/>Surprise: " + String(data[i].surprise));
      xActual.push(data[i].actual);
      xEstimate.push(data[i].estimate);
    }
    this.earningsChartOptions = {
      title: {
        text: "Historical EPS Surprises"
      },
      credits: {
        enabled: false
      },
      chart: {
        backgroundColor: '#F0F0F0'
      },
      xAxis: {
        categories: xCategories
      },
      yAxis: {
        title: {
          text: 'Quantity EPS'
        },
      },
      tooltip: {
        shared: true,
      },
      series: [
        {
          data: xActual,
          name: 'Actual',
          type: 'spline'
        },
        {
          data: xEstimate,
          name: 'Estimate',
          type: 'spline'
        }
      ]
    };
  }

  presentSummaryChart() {
    var data = JSON.parse(window.localStorage.getItem('summaryChart') || "{}");
    var color = 'green';
    if (Number(this.dp) < 0) {
      color = 'red';
    }
    var price = [];
    var datetime = [];
    for (var i = 0; i < data.results.length; i++) {
      datetime[i] = data.results[i].t, 
      price[i] = data.results[i].c;
    }
    this.summaryChartOptions = {
      title: {
        text: `${this.ticker} Hourly Price Variation`
      },
      scrollbar: {
        enabled: true
      },
      credits: {
        enabled: false
      },
      chart: {
        backgroundColor: '#F0F0F0',
        scrollablePlotArea: {
          minWidth: 800,
        }
      },
      xAxis: {
        type: 'datetime',
        labels: {
          enabled: true,
          format: '{value:%H:%M}',
        },
        categories: datetime,
        tickInterval: 3,
        tickWidth: 1
      },
      yAxis: {
        title: {
          text: ''
        },
        opposite: true
      },
      series: [{
        showInLegend: false,
        data: price,
        type: 'line',
        name: 'Price',
        marker: {
          enabled: false
        },
        color: color
      }]
    };
  }

  presentHistoryChart() {
    var ohlc = [];
    var volume = [];
    var data = JSON.parse(window.localStorage.getItem('historyChart') || "{}");
    for (var i = 0; i < data.results.length; i++) {
      ohlc.push([data.results[i].t, data.results[i].o, data.results[i].h, data.results[i].l, data.results[i].c]);
      volume.push([data.results[i].t, data.results[i].v]);
    }
    this.util.ticker = this.ticker;
    this.util.ohlc = ohlc;
    this.util.volume = volume;
    setTimeout(() => { this.historyChartReadyFlag = true; });
  }

  // data load flags checking
  checkDataLoadFlags() {
    if(this.profileLoadedFlag &&
      this.latestLoadedFlag &&
      this.newsLoadedFlag &&
      this.recommendationLoadedFlag &&
      this.socialSentimentLoadedFlag &&
      this.peersLoadedFlag &&
      this.earningsLoadedFlag &&
      this.historyChartLoadedFlag) {
      this.util.setValidDataPresentFlag(true);
      this.resetDataLoadFlags();
    }
  }

  resetDataLoadFlags() {
    this.profileLoadedFlag = false;
    this.latestLoadedFlag = false;
    this.newsLoadedFlag = false;
    this.recommendationLoadedFlag = false;
    this.socialSentimentLoadedFlag = false;
    this.peersLoadedFlag = false;
    this.earningsLoadedFlag = false;
    this.summaryChartLoadedFlag = false;
    this.historyChartLoadedFlag = false;
    this.historyChartReadyFlag = false;
  }

  // transaction
  startBuyTransaction() {
    let modalRef = this.modalService.open(TransactionComponent);
    modalRef.componentInstance.mode = 'Buy';
    modalRef.componentInstance.name = this.name;
    modalRef.componentInstance.ticker = this.ticker;
    modalRef.componentInstance.price = Number(this.c);
    modalRef.result.then(data => {
      if (data == 'success') {
        this.stockHoldingFlag = true;
        this.buyAlertFlag = true;
        const tsrc = timer(3000);
        tsrc.subscribe(() => {
          this.buyAlertFlag = false;
        });
      }
    }).catch(() => {});
  }

  startSellTransaction() {
    let modalRef = this.modalService.open(TransactionComponent);
    modalRef.componentInstance.mode = 'Sell';
    modalRef.componentInstance.ticker = this.ticker;
    modalRef.componentInstance.price = Number(this.c);
    modalRef.result.then(data => {
      if (data == 'success' || data == 'zero') {
        if (data == 'zero') {
          this.stockHoldingFlag = false;
        }
        this.sellAlertFlag = true;
        const tsrc = timer(3000);
        tsrc.subscribe(() => {
          this.sellAlertFlag = false;
        });
      }
    }).catch(() => {});
  }

  // watchlist & portfolio
  setWatchlist() {
    this.watchlistActivateFlag = true;
    this.watchlistRemoveFlag = false;
    this.watchlistAddFlag = true;
    this.watchlistService.addToWatchlist(this.ticker, this.name);
    const tsrc = timer(3000);
    tsrc.subscribe(() => {
      this.watchlistAddFlag = false;
    });
  }

  unsetWatchlist() {
    this.watchlistActivateFlag = false;
    this.watchlistAddFlag = false;
    this.watchlistRemoveFlag = true;
    this.watchlistService.removeFromWatchlist(this.ticker);
    const tsrc = timer(3000);
    tsrc.subscribe(() => {
      this.watchlistRemoveFlag = false;
    });
  }

  resetAlertFlags() {
    this.watchlistAddFlag = false;
    this.watchlistRemoveFlag = false;
    this.buyAlertFlag = false;
    this.sellAlertFlag = false;
  }
}
