import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms'; 
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { StockAddPage } from '../stock-add/stock-add.page';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Stock } from '../models/stocks.interface';
import { PriceData } from '../models/pricedata.interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  stock:any;
  formGroup: FormGroup;
  errors: Array<string>;
  
  followedStocks$:Observable<Stock[]>;
  constructor(
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
    public modalController: ModalController
  
  ) {
  }

  ngOnInit(){
    // get collections from firebase (this.stocks = ...)
    this.authService.auth.subscribe( (user) => {
      if( user ){
        let uid = user.uid;
        this.followedStocks$ = this.dataService.getStocks( uid );
        this.followedStocks$.subscribe((data) => {
          console.log(data);
        })
      }
    });
  }

  async StockAddPage(){
      const modal = await this.modalController.create({
        component: StockAddPage
      });
      //get data from modal when closed
      modal.onDidDismiss().then((response) => {
        if( response.data !== undefined ){
          //get data from the stock-add modal
          let data = response.data;
          let stock = {symbol: response.data.symbol }
          let pricedata = response.data.pricedata;
          this.dataService.addStock( data );
          this.dataService.getPriceData(stock).then((response:Observable<PriceData>) => {
            this.dataService.addPriceData(pricedata);
          })
        }
      });
      return await modal.present();
  }
  updatePrices(){
     
  }
}
