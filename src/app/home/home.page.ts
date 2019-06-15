import { Component, OnInit } from '@angular/core';
import {MainService} from '../main.service';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms'; 
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { StockAddPage } from '../stock-add/stock-add.page';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Stocks } from '../models/stocks.interface';



interface Stock {
  symbol: string
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  stock:any;
  formGroup: FormGroup;
  errors: Array<string>;
  stocks:{
    name: string,
    currentPrice: number, 
    priceCompare: string, 
    priceYesterday: number
  }[];
  followedStocks$:Observable<Stocks[]>;
  constructor(
    private _mainService: MainService,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
    public modalController: ModalController
  
  ) {
    // this.stock = { symbol: ''};
  }

  ngOnInit(){
    // get collections from firebase (this.stocks = ...)
    this.authService.auth.subscribe( (user) => {
      if( user ){
        let uid = user.uid;
        console.log(uid);
        this.followedStocks$ = this.dataService.getStocks( uid );
        this.followedStocks$.subscribe((data) => {
          console.log(data);
        })
      }
    });
  }
  
    
  

  // getCurrentPrice(){
  //   // this.errors = [];
  //   // this.stocks = [];
  //   this._mainService.getCurrentPrice(this.stock,(stockSymbol, valid) => {
  //     if(valid === true){
  //       this.getPrice(stockSymbol);
  //     }else{
  //       this.errors.push(stockSymbol);
  //       this.stock = { symbol: ''};
  //     }
  //   })
  // }

  // getPrice(stockSymbol){
  //   this._mainService.getPrice(stockSymbol, (Name, CurrentPrice, PriceYesterday) => {
  //     var retrievedStock = { name: Name,
  //                            currentPrice: CurrentPrice,
  //                            priceCompare:(CurrentPrice - PriceYesterday).toFixed(2),
  //                            priceYesterday:PriceYesterday};

  //     this.stocks.push(retrievedStock);
  //     this.stock = {symbol: ''};
  //   })
  // }

  async StockAddPage(){
      const modal = await this.modalController.create({
        component: StockAddPage
      });
      //get data from modal when closed
      modal.onDidDismiss().then((response) => {
        if( response.data !== undefined ){
          let data = response.data;
        }
      });
      return await modal.present();
  }

}
