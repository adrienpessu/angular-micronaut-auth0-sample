import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AuthHttpInterceptor, AuthModule} from "@auth0/auth0-angular";
import {environment} from "../environments/environment";
import { SafeComponent } from './safe/safe.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SafeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    AuthModule.forRoot({
      domain: environment.auth0.domain,
      clientId: environment.auth0.client_id,
      // Request this audience at user authentication time
      audience: environment.auth0.audience,

      // Request this scope at user authentication time
      scope: '',

      // Specify configuration for the interceptor
      httpInterceptor: {
        allowedList: [
          {
            // Match any request that starts 'https://YOUR_DOMAIN/api/v2/' (note the asterisk)
            uri: `${environment.apiUrl}/*`,
            tokenOptions: {
              // The attached token should target this audience
              audience: environment.apiUrl,

              // The attached token should have these scopes
              scope: '',
            },
          },
        ],
      },
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
