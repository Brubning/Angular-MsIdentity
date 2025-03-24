import { Component, inject, OnInit, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    JsonPipe
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  profile = signal<ProfileType | null>(null);
  user = signal<any | null>(null);

  #msalService = inject(MsalService);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getProfile('https://graph.microsoft.com/v1.0/me');
  }

  getProfile(url: string) {
    this.http.get(url).subscribe((profile) => {
      this.profile.set(profile);
    });
  }

  public callWebApi() {
    
    this.http.get('http://localhost:5221/user').subscribe(
      (user) => {
        this.user.set(user);
      }
    )
  }

  public callWebApiAuth() {
    
    this.http.get('http://localhost:5221/user/auth').subscribe(
      (user) => {
        this.user.set(user);
      }
    )
  }

  public logout() {
    this.#msalService.logoutRedirect();
  }
}

export type ProfileType = {
  givenName?: string;
  surname?: string;
  userPrincipalName?: string;
  id?: string;
};