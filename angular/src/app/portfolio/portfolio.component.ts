import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { timer } from 'rxjs';

import { UtilService } from '../util.service';
import { DataService } from '../data.service';
import { TransactionService } from '../transaction.service';
import { TransactionComponent } from '../transaction/transaction.component';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  stocklistEmptyAlert: boolean = true;
  balance: number = 25000;
  stockhold: any;
  stocklist: any[] = [];

  alertTicker: string = '';
  buyAlertFlag: boolean = false;
  sellAlertFlag: boolean = false;

  constructor(
    private router: Router,
    private util: UtilService,
    private dataService: DataService,
    private transactionService: TransactionService,
    private modalService: NgbModal
  ) {
    
  }

  onCardClick(symbol: string) {
    this.util.setSearchSymbol(symbol);
    this.util.setCardSwitchFlag(true);
    this.util.setNavbarCardSwitchFlag(true);
    this.router.navigateByUrl('/search/'+symbol);
  }

  startBuyTransaction(ticker: string, name: string, price: string) {
    this.alertTicker = ticker;
    let modalRef = this.modalService.open(TransactionComponent);
    modalRef.componentInstance.mode = 'Buy';
    modalRef.componentInstance.name = name;
    modalRef.componentInstance.ticker = ticker;
    modalRef.componentInstance.price = Number(price);
    modalRef.result.then(data => {
      if (data == 'success') {
        this.refreshStockList();
        this.buyAlertFlag = true;
        const tsrc = timer(3000);
        tsrc.subscribe(() => {
          this.buyAlertFlag = false;
        });
      }
    }).catch(() => {});
  }

  startSellTransaction(ticker: string, price: string) {
    this.alertTicker = ticker;
    let modalRef = this.modalService.open(TransactionComponent);
    modalRef.componentInstance.mode = 'Sell';
    modalRef.componentInstance.ticker = ticker;
    modalRef.componentInstance.price = Number(price);
    modalRef.result.then(data => {
      if (data == 'success' || data == 'zero') {
        this.refreshStockList();
        this.sellAlertFlag = true;
        const tsrc = timer(3000);
        tsrc.subscribe(() => {
          this.sellAlertFlag = false;
        });
      }
    }).catch(() => {});
  }

  async ngOnInit(): Promise<void> {
    this.stocklist = [];
    this.stocklistEmptyAlert = true;
    this.balance = await this.transactionService.getBalance();
    this.stockhold = await this.transactionService.getStockhold();
    for (var k in this.stockhold) {
      var item = this.stockhold[k];
      item.total = Number(item.totalCost).toFixed(2);
      item.avg = (Number(item.total) / Number(item.quantity)).toFixed(2);
      item.change = '';
      item.current = String(item.avg);
      item.value = item.total;
      item.color = "text-success"; // text color
      this.stocklist.push(item);
      this.dataService.getLatestDataBySymbol(item.ticker);
    }
    this.stocklistEmptyAlert = this.stocklist.length == 0;
    this.util.setPortfolioTab();
    this.dataService.latestDataBySymbolReadySubject.subscribe(data => {
      if (data == null || data == '') {
        return;
      }
      var dataobj = JSON.parse(data);
      for (var i = 0; i < this.stocklist.length; i++) {
        if (dataobj.symbol == this.stocklist[i].ticker) {
          this.stocklist[i].current = dataobj.c;
          var change = Number(this.stocklist[i].current) - Number(this.stocklist[i].avg);
          if (change < 0) {
            this.stocklist[i].color = "text-danger";
          } else if (change > 0) {
            this.stocklist[i].color = "text-success";
          } else {
            this.stocklist[i].color = "";
          }
          this.stocklist[i].change = change.toFixed(2);
          this.stocklist[i].value = (Number(dataobj.c) * this.stocklist[i].quantity).toFixed(2);
        }
      }
    });
  }

  async refreshStockList() {
    this.stocklist = [];
    this.stocklistEmptyAlert = true;
    this.balance = await this.transactionService.getBalance();
    this.stockhold = await this.transactionService.getStockhold();
    for (var k in this.stockhold) {
      var item = this.stockhold[k];
      item.total = Number(item.totalCost).toFixed(2);
      item.avg = (Number(item.total) / Number(item.quantity)).toFixed(2);
      item.change = '';
      item.current = String(item.avg);
      item.value = item.total;
      item.color = "text-success"; // text color
      this.stocklist.push(item);
      this.dataService.getLatestDataBySymbol(item.ticker);
    }
    this.stocklistEmptyAlert = this.stocklist.length == 0;
    this.util.setPortfolioTab();
    this.dataService.latestDataBySymbolReadySubject.subscribe(data => {
      if (data == null || data == '') {
        return;
      }
      var dataobj = JSON.parse(data);
      for (var i = 0; i < this.stocklist.length; i++) {
        if (dataobj.symbol == this.stocklist[i].ticker) {
          this.stocklist[i].current = dataobj.c;
          var change = Number(this.stocklist[i].current) - Number(this.stocklist[i].avg);
          if (change < 0) {
            this.stocklist[i].color = "text-danger";
          } else if (change > 0) {
            this.stocklist[i].color = "text-success";
          } else {
            this.stocklist[i].color = "";
          }
          this.stocklist[i].change = change.toFixed(2);
          this.stocklist[i].value = (Number(dataobj.c) * this.stocklist[i].quantity).toFixed(2);
        }
      }
    });
  }

}
