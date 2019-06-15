import { Component, OnInit } from '@angular/core';
import {MainService} from '../main.service';
import { HttpClientModule } from '@angular/common/http';
import { AlertController, ModalController } from '@ionic/angular';
import { Http } from '@angular/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
//we need this to add stuff into the collections.
//import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

import { DataService } from '../data.service';
import { Observable } from 'rxjs';
import { Symbol } from '../models/symbol.interface';


@Component({
  selector: 'app-stock-add',
  templateUrl: './stock-add.page.html',
  styleUrls: ['./stock-add.page.scss'],
})
export class StockAddPage implements OnInit {
  loading:boolean = true;
  symbols:Array<any>;
  suggestSymbols:Array<any> = [];
  symbolForm: FormGroup;
  currentStockPrice:Number;
  items: string[];
   //stock: string;

  //symbol: object;

  errors: string[];

  // stocks: {
  //   name: string,
  //    currentPrice: number, 
  //    priceCompare: string, 
  //    priceYesterday: number
  // }[];

  //we need to push this into the DB and 
  //ALSO dont forget the openData which is the current price.
  stockSymbol: string;

  //this is what is being pushed into the collection.
  //stockCollection: AngularFirestoreCollection<any> = this.afs.collection('stocks');

  constructor(
    private _mainService: MainService,
    private http: Http,
    public alertController: AlertController,
    private modalController: ModalController,
    public httpClientModule: HttpClientModule,
    private formBuilder: FormBuilder,
    //public afs: AngularFirestore,
    private dataService:DataService
   
  ) { }

  ngOnInit() {
    this.symbolForm = this.formBuilder.group({
      symbolSearch: [ '', [Validators.required] ]
    });
    this.symbolForm.valueChanges.subscribe((search) => {
      if( search.symbolSearch.length > 0 ){
        this.findSymbols( search.symbolSearch );
      }
      else{
        this.suggestSymbols = [];
      }
    });
    this.getSymbols();
  }

  getSymbols(){
    this.dataService.symbols$.subscribe((values) => {
      this.loading = false;
      this.symbols = values;
      console.log( this.symbols );
    });
  }
  //find symbols is not working atm
  findSymbols( searchTerm:string ){
    console.log( searchTerm );
    this.suggestSymbols = this.symbols.filter((item) => {
      if( item.Symbol.toLowerCase().indexOf( searchTerm.toLowerCase() ) !== -1 ){
        return item;
      }
    });
    console.log( this.suggestSymbols );
  }
  //this function searches for the stock then returns if it is not found return error message
  findStock(stockSymbol, cb){
  //if this symbol exists - console Log exists then retrieve the information regarding the symbol
    if( this.stockSymbol ){
      console.log("stock symbol ",this.stockSymbol, " found");
      this.http.get('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol='+this.stockSymbol+'&interval=1min&apikey=V5JC59JK1GR6EUKJ').subscribe((response) => {
       
        let _body = response["_body"]
        console.log(typeof _body);
        console.log(response);
         const jsonParseResp = JSON.parse(_body);
         console.log('json', jsonParseResp["Time Series (1min)"]);
         
         let metaData = jsonParseResp["Meta Data"];
         let lastRefresh = metaData["3. Last Refreshed"]
       //getting the most updated updated price here.
         console.log("last Refreshed", lastRefresh);
         
         let timeSeries = jsonParseResp["Time Series (1min)"]
         let lastRefreshData = timeSeries[lastRefresh]
         //now that we got here we can view the open price being the most current price
         let openData = lastRefreshData["1. open"]

         console.log("price: ", openData)
          this.currentStockPrice = openData;
       
        
    }); //however else if this does not exist, show symbol not found.
    }
  }
  
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Found it!',
     // subHeader: '',
      message: 'Stock Symbol: '+ this.stockSymbol + ' found!',
      //buttons: ['Thanks!']
    });

    await alert.present();
  }

  
    saveStocks(){
      //in the users collection we hold the following variables.
      // console.log("uid: ", this.authService.getUser());
      //const stockID = this.afs.createId();
      // const uid:string = this.authService.getUser().uid;
      const stock = {
        //get uid
        //uid: this.authService.getUser().uid,
        //time added into collection + date
        timestamp: new Date(),
        //what stock symbol was searched.
        stock: this.stockSymbol,
        //and also the current price AKA -- open price
        price: this.currentStockPrice,
        // stockID: stockID
      }
      
      //this.afs.doc(`stocks/${stockID}`).set(stock);
      //this.afs.doc(`users/${uid}/stocks/${stockID}`).set(stock);
      //show saved alert!
      this.presentSavedInfoAlert();
      
  }

  async presentSavedInfoAlert() {
    const alert = await this.alertController.create({
      header: 'Saved!',
    // subHeader: '',
      message: 'Saved ' + this.stockSymbol + ' ' + ' into collections',
      //buttons: ['Thanks!']
    });

    await alert.present();
  }
  close(){
    this.modalController.dismiss();
  }
  save(){

  }
}
