import { Component, OnInit } from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {ApiService} from "../api.service";

@Component({
  selector: 'app-safe',
  templateUrl: './safe.component.html',
  styleUrls: ['./safe.component.scss']
})
export class SafeComponent implements OnInit {

  output: string = '';
  user: string = '';

  constructor(public auth: AuthService, private apiService: ApiService) { }

  ngOnInit(): void {
  }

  apiCall() {
    this.apiService.home().subscribe( result => {
      this.output = JSON.stringify(result, undefined, 2);
    }, error => {
      this.output = JSON.stringify(error, undefined, 2);
    });
  }

}
