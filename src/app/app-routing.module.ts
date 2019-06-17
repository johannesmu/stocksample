import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'stock-add',
    loadChildren: './stock-add/stock-add.module#StockAddPageModule'
  },
  { path: 'signup', loadChildren: './signup/signup.module#SignupPageModule' },
  { path: 'signin', loadChildren: './signin/signin.module#SigninPageModule' },
  { path: 'signout', loadChildren: './signout/signout.module#SignoutPageModule' },
  { path: 'stock-add', loadChildren: './stock-add/stock-add.module#StockAddPageModule' },
  { path: 'history', loadChildren: './history/history.module#HistoryPageModule' },  { path: 'stock-detail', loadChildren: './stock-detail/stock-detail.module#StockDetailPageModule' }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
