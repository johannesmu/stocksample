import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { Stock } from '../app/models/stocks.interface';
import { Http } from '@angular/http';
import jsonData from '../assets/nasdaq-listed_json.json';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  symbolsData:Array<any> = jsonData;
  symbols$:BehaviorSubject<Symbol[]> = new BehaviorSubject(null);
  symbolsCollection: AngularFirestoreCollection<any>;
  stocksCollection: AngularFirestoreCollection<Stock>;
  userStocks:Observable<Stock[]>;
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
    let path = `users/${uid}/stocks`;
    this.stocksCollection = this.afs.collection<Stock>(path);
    this.userStocks = this.stocksCollection.valueChanges();
    return this.userStocks;
  }
  addStock(stock: Stock) {
    this.stocksCollection.add(stock);
  }
  //this function searches for the stock then returns if it is not found return error message
  getStockBySymbol(stockSymbol){
    return new Promise((resolve,reject) => {
      //api url
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockSymbol}&interval=1min&apikey=V5JC59JK1GR6EUKJ`;
      //api call and subscribe to get value
      this.http.get(url).subscribe( (response:any) => {
        const data = JSON.parse( response._body );
        if( data["Error Message"] ){
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
          let output:any = {};
          output.symbol = stockSymbol;
          output.time = new Date();
          resultKeys.forEach( (resultKey, index ) => {
            output[ newKeys[index] ] = resultValues[ index ];
          });
          resolve( output );
        }
      });
    });
  }
}
