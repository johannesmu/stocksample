import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { Stock } from '../app/models/stocks.interface';
import { PriceData } from '../app/models/pricedata.interface';
import { Http } from '@angular/http';
import jsonData from '../assets/nasdaq-listed_json.json';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  currentPath:string;
  pricesPath:string;
  symbolsData:Array<any> = jsonData;
  symbols$:BehaviorSubject<Symbol[]> = new BehaviorSubject(null);
  stocksCollection: AngularFirestoreCollection<Stock>;
  userStocks:Observable<Stock[]>;

  priceDataCollection: AngularFirestoreCollection<PriceData>;
  priceData:Observable<PriceData[]>;
  constructor(
    private afs: AngularFirestore,
    private http: Http
  ) 
  {
    this.getSymbols();
  }
  getSymbols(){
    this.symbols$.next( this.symbolsData );
  }

  getStocks(uid):Observable<Stock[]>{
    this.currentPath = `users/${uid}/stocks`;
    this.stocksCollection = this.afs.collection<Stock>(this.currentPath);
    this.userStocks = this.stocksCollection.valueChanges();
    return this.userStocks;
  }
  addStock(stock: Stock) {
    //this is the first time the stock is added
    this.stocksCollection.add({symbol: stock.symbol});
  }
  deleteStock(stock:Stock){
    return new Promise((resolve,reject) => {
      let collection:AngularFirestoreCollection<Stock> = this.afs.collection( 
        this.currentPath , 
        ref => ref.where('symbol','==',stock.symbol )
      );
      let stocks = collection.valueChanges({idField:'id'});
      stocks.subscribe( (values) => {
        collection.doc( values[0].id ).delete();
      });
      resolve(true);
    });
  }
  getPriceData( stock:Stock ){
    return new Promise((resolve,reject) => {
      // create a collection of stocks
      let stocks:AngularFirestoreCollection<Stock> = this.afs.collection( 
        this.currentPath , 
        ref => ref.where('symbol','==', stock.symbol )
      );
      // set an observable containing stocks with their id
      let stockData:Observable<any> = stocks.valueChanges({idField: 'id'});
      // subscribe to get the document as an array containing the id
      stockData.subscribe((values) => {
        let docId = values[0].id;
        // store the current path to prices collection in pricesPath variable
        this.pricesPath = `${this.currentPath}/${docId}/prices`;
        this.priceDataCollection = this.afs.collection<PriceData>( this.pricesPath );
        this.priceData = this.priceDataCollection.valueChanges();
        resolve(this.priceData);
      });
    });
  }
  updateStockPriceData( stock:Stock ){
    this.getStockBySymbol( stock.symbol )
    .then( ( response: any ) => {
      this.addPriceData( response.pricedata );
    })
  }
  addPriceData( data:PriceData ){
    this.priceDataCollection.add(data);
  }
  deletePriceData(){
    return new Promise( (resolve, reject) => {
      let pricesCollection:AngularFirestoreCollection<Stock> = this.afs.collection(this.pricesPath);
      let prices = pricesCollection.valueChanges({idField: 'id'});
      prices.subscribe((values) => {
        values.forEach( (priceItem) => {
          pricesCollection.doc( priceItem.id ).delete();
        })
      });
      resolve( true );
    });
  }

  //this function resolves the Promise with stock data or reject with an Error message
  getStockBySymbol(stockSymbol){
    return new Promise((resolve,reject) => {
      //api url
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockSymbol}&interval=1min&apikey=V5JC59JK1GR6EUKJ`;
      //api call and subscribe to get value
      this.http.get(url).subscribe( (response:any) => {
        const data = JSON.parse( response._body );
        if( data["Error Message"] ){
          console.log(response);
          //reject the promise with the error message
          reject( data["Error Message"] );
        }
        else{
          //process response
          const keys:Array<string> = Object.keys(data["Time Series (1min)"]);
          //get the last in the series
          const result = data["Time Series (1min)"][ keys[ keys.length -1 ] ];
          //format the result using sensible keys
          const resultKeys:Array<string> = Object.keys( result );
          const resultValues:Array<string> = Object.values( result );
          //remove the numbers in the keys so '1. open' becomes 'open'
          const newKeys = resultKeys.map( (key) => {
            return key.substring(3);
          });
          let output:any = { symbol: stockSymbol };
          let pricedata:any = { time: new Date() };
          resultKeys.forEach( (resultKey, index ) => {
            pricedata[ newKeys[index] ] = resultValues[ index ];
          });
          output.pricedata = pricedata;
          resolve( output );
        }
      });
    });
  }
}
