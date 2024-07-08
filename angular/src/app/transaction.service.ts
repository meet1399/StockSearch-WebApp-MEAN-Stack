import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  balance: number = 25000;
  stockhold: [] = [];

  constructor() {
    this.getPortfolio();
    this.getBalance();
    this.getStockhold();
  }

  async getPortfolio() {
    var url = "http://localhost:3000/api/getPortfolio"; 
    const data = await axios.get(url).then(data => {
        return data.data;
    }).catch(() => {
    });
    return data;
  }

  async getBalance() {
    var data = await this.getPortfolio();
    this.balance = data.balance.toFixed(2);
    return this.balance;
  }

  async getStockhold() {
    var data = await this.getPortfolio();
    this.stockhold = data.stocks;
    return this.stockhold;
  }

  async isHoldingStock(ticker: string) {
    var stockhold = await this.getPortfolio();
    for(var i in stockhold.stocks){
      if(stockhold.stocks[i].ticker == ticker){
          return true;
      }
    }
    return false;
  }

  async getHoldingQuantity(ticker: string) {
    var stockhold = await this.getPortfolio();
    for(var i in stockhold.stocks){
      if(stockhold.stocks[i].ticker == ticker){
          return stockhold.stocks[i].quantity;
      }
    }
    return 0;
  }

  buyStock(ticker: string, name: string, quantity: number, totalCost: number) {
    var url = "http://localhost:3000/api/buyStock/" + ticker + "/" + name + "/" + quantity + "/" + totalCost;
    axios.get(url).then(data => {
    }).catch(() => {
    });
  }

  sellStock(ticker: string, quantity: number, totalCost: number) {
    var url = "http://localhost:3000/api/sellStock/" + ticker + "/" + quantity + "/" + totalCost;
    const successFlag = axios.get(url).then(data => {
      return true;
    }).catch(() => {
      return false;
    });
    return successFlag;
  }

}
