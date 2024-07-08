import { Component, OnInit } from '@angular/core';
import { UtilService } from '../util.service';

import * as Highstock from 'highcharts/highstock';
import HC_more from 'highcharts/highcharts-more';
import HC_exporting from 'highcharts/modules/exporting';
import HC_drag_pane from 'highcharts/modules/drag-panes'
import HC_indicators_all from 'highcharts/indicators/indicators-all';
import HC_vbp from 'highcharts/indicators/volume-by-price';
HC_more(Highstock);
HC_exporting(Highstock);
HC_drag_pane(Highstock);
HC_indicators_all(Highstock);
HC_vbp(Highstock);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  ticker: string = '';
  ohlc: number[][];
  volume: number[][];
  groupingUnits = [[
    'week',                         
    [1]                             
], [
    'month',
    [1, 2, 3, 4, 6]
]];

  highstock: typeof Highstock = Highstock;
  historyChartOptions!: Highstock.Options;

  constructor(private util: UtilService) { 
    this.ticker = util.ticker;
    this.ohlc = this.util.ohlc;
    this.volume = this.util.volume;
  }

  ngOnInit(): void {
    this.historyChartOptions = {
      title: {
        text: this.ticker + ' Historical'
      },
      subtitle: {
        text: 'With SMA and Volume by Price technical indicators'
      },
      navigator: {
        enabled: true
      },
      scrollbar: {
        enabled: true
      },
      chart: {
        backgroundColor: '#F0F0F0',
      },
      credits: {
        enabled: false
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: [{
        startOnTick: false,
        endOnTick: false,
        opposite: true,
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'OHLC'
        },
        height: '60%',
        lineWidth: 2,
        resize: {
          enabled: true
        }
      }, {
        labels: {
          align: 'right',
          x: -3
        },
        opposite: true,
        title: {
          text: 'Volume'
        },
        top: '65%',
        height: '35%',
        offset: 0,
        lineWidth: 2
      }],
      tooltip: {
        split: true
      },
      plotOptions: {
        series: {
          dataGrouping: {
            units: [[
              'week',                         
              [1]                             
          ], [
              'month',
              [1, 2, 3, 4, 6]
          ]]
          }
        },
      },
      series: [{
        showInLegend: false,
        type: 'candlestick',
        name: this.ticker,
        id: this.ticker,
        zIndex: 2,
        data: this.ohlc
      }, {
        showInLegend: false,
        type: 'column',
        name: 'Volume',
        id: 'volume',
        data: this.volume,
        yAxis: 1
      }, {
        type: 'vbp',
        linkedTo: this.ticker,
        params: {
          volumeSeriesID: 'volume'
        },
        dataLabels: {
          enabled: false
        },
        zoneLines: {
          enabled: false
        }
      }, {
        type: 'sma',
        linkedTo: this.ticker,
        zIndex: 1,
        marker: {
          enabled: false
        }
      }],
      rangeSelector: {
        buttons: [{
          type: 'month',
          count: 1,
          text: '1m'
        },
        {
          type: 'month',
          count: 3,
          text: '3m'
        },
        {
          type: 'month',
          count: 6,
          text: '6m'
        },
        {
          type: 'ytd',
          text: 'YTD'
        },
        {
          type: 'year',
          count: 1,
          text: '1y'
        },
        {
          type: 'all',
          text: 'All'
        }],
        selected: 2,
        enabled: true,
      }
    };
  }

}
