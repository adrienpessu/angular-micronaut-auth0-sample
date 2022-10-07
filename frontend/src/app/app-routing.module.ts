import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {AuthGuard, AuthModule} from "@auth0/auth0-angular";
import {SafeComponent} from "./safe/safe.component";

const routes: Routes = [{
  path: '', component: HomeComponent, pathMatch: 'full'
}, {
  path: 'safe', component: SafeComponent, canActivate: [AuthGuard]
}];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
