import {
  Component,
  inject
} from '@angular/core';

import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  #authenticationService = inject(AuthenticationService);
  currentUser = this.#authenticationService.user;
  isLoggedIn = this.#authenticationService.isLoggedIn;

  public loginRedirect() {
    this.#authenticationService.loginRedirect();
  }

  public loginPopup() {
    this.#authenticationService.loginPopup();
  }

  public goHome() {

  }
}
