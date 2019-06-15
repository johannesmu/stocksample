import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { Stocks } from '../app/models/stocks.interface';
import jsonData from '../assets/nasdaq-listed_json.json';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  symbolsData:Array<any> = jsonData;
  symbols$:BehaviorSubject<Symbol[]> = new BehaviorSubject(null);
  symbolsCollection: AngularFirestoreCollection<any>;
  stocksCollection: AngularFirestoreCollection<Stocks>;
  userStocks:Observable<Stocks[]>;
  constructor(
    private afs: AngularFirestore
  ) 
  {
    this.getSymbols();
  }
  getSymbols(){
    //not using because of Firebase out of quota error
    // let path = 'symbols';
    // this.symbolsCollection = this.afs.collection<Symbol>(path, ref => ref.orderBy('Company Name'));
    // this.symbolsCollection.valueChanges().subscribe( (values) => {
    //   this.symbols$.next( values );
    // });
    this.symbols$.next( this.symbolsData );
  }

  getStocks(uid):Observable<Stocks[]>{
    let path = `users/${uid}/stocks`;
    this.stocksCollection = this.afs.collection<Stocks>(path);
    this.userStocks = this.stocksCollection.valueChanges();
    return this.userStocks;
  }
  addStock(stock: Stocks) {
    this.stocksCollection.add(stock);
  }
}
