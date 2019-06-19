import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { PriceData } from '../models/pricedata.interface';
import { Stock } from '../models/stocks.interface';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-stock-detail',
  templateUrl: './stock-detail.page.html',
  styleUrls: ['./stock-detail.page.scss'],
})

export class StockDetailPage implements OnInit {
  stock:Stock;
  priceData$:Observable<PriceData[]>;

  @ViewChild('chart') chartCanvas;
  chart:any;

  constructor(
    private modalController:ModalController,
    private dataService:DataService,
    private alertController:AlertController
  ) { }

  ngOnInit() {
    this.dataService.getPriceData(this.stock)
    .then( (response:Observable<PriceData[]>) => {
      this.priceData$ = response;
      this.priceData$.subscribe( (values) => {
        let chartLabels:Array<any> = [];
        let chartData:Array<number> = [];
        values.forEach( (value, index ) => {
          let date = value.time.toDate();
          chartLabels.push( index );
          chartData.push(value.close);
        });
        this.chart = new Chart(this.chartCanvas.nativeElement,{
          type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: `${this.stock.symbol} prices`,
                    data: chartData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
      });
    });
    
  }
  close(){
    this.modalController.dismiss();
  }
  async clearData(){
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      subHeader: 'This action will delete all price data for this stock',
      message: `There will be no price data for ${this.stock.symbol} after this`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('cancelled');
          }
        },
        {
          text: 'OK',
          role: 'ok',
          handler: () => {
            this.dataService.deletePriceData().then(()=>{ this.modalController.dismiss() });
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteStock(){
    const  alert = await this.alertController.create({
      header: 'Are you sure?',
      subHeader: 'This action will delete this stock',
      message: `You will not be able to track ${this.stock.symbol} after this`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('cancelled');
          }
        },
        {
          text: 'OK',
          role: 'ok',
          handler: () => {
            this.dataService.deleteStock( this.stock).then( () => { this.modalController.dismiss() }); 
          }
        }
      ]
    });
    await alert.present();
  }
  updateStock(){
    this.dataService.updateStockPriceData( this.stock );
  }
}
