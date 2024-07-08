import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {

  constructor() { 
    this.getWatchlistObject();
  }

  async getWatchlistObject() {
    var url = "http://localhost:3000/api/getWatchlist"; 

    const data = await axios.get(url).then(data => {
        return data.data;
    }).catch(() => {
    });
    return data;
  }

  async isTickerInWatchlist(ticker: string) {
    var watchlist = await this.getWatchlistObject();
    for( var i in watchlist){
      if(watchlist[i].ticker == ticker){
        return true;
      } 
    }
    return false;
  }

  addToWatchlist(ticker: string, name: string) {
    var url = "http://localhost:3000/api/addToWatchlist/" + ticker + "/" + name;
    axios.get(url).then(data => {
    }).catch(() => {
    });
    this.isTickerInWatchlist(ticker);
  }
  
  removeFromWatchlist(ticker: string) {
    var url = "http://localhost:3000/api/deleteFromWatchlist/" + ticker;
    axios.get(url).then(data => {
    }).catch(() => {
    });
  }

}
