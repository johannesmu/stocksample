import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import {Stocks} from '../app/models/stocks.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  stocksCollection: AngularFirestoreCollection<Stocks>;
  userStocks:Observable<Stocks[]>;
  constructor(
    private afsc: AngularFirestoreCollection,
    private afs: AngularFirestore
  ) 
  {}
 
  // getUsersStock(userID: AngularFirestoreCollection){
  //   return this.afirestore.collection('stocks',ref => ref.where('uid', '==', userID));
  // }

  getStocks(uid):Observable<Stocks[]>{
    let path = `users/${uid}/stocks`;
    this.stocksCollection = this.afs.collection<Stocks>(path);
    this.userStocks = this.stocksCollection.valueChanges();
    return this.userStocks;
  }
 
}
