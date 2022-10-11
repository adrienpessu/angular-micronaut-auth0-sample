import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "@auth0/auth0-angular";
import {take} from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(public auth: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.auth.isAuthenticated$.pipe(take(1)).subscribe(result => {
      if (result) {
        this.goToASafePlace();
      }
    });
  }

  goToASafePlace() {
    this.router.navigate(['/safe']);
  }
}
