import {
  Injectable,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed
} from '@angular/core';
import {
  Router
} from '@angular/router';
import { Subject } from 'rxjs';
import {
  filter,
  takeUntil
} from 'rxjs/operators';

import {
  MsalService,
  MsalBroadcastService
} from '@azure/msal-angular';

import {
  AuthenticationResult,
  InteractionStatus,
  PopupRequest,
  RedirectRequest,
  EventMessage,
  EventType,
} from '@azure/msal-browser';
import { environment } from '../../environments/environment';

import { MSALGuardConfigFactory } from './msal/factories';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements OnInit, OnDestroy {

  constructor() {
    
    this.#msalService.handleRedirectObservable().subscribe();
    this.#msalService.instance.enableAccountStorageEvents(); // Optional - This will enable ACCOUNT_ADDED and ACCOUNT_REMOVED events emitted when a user logs in or out of another tab or window
    this.#msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (msg: EventMessage) =>
            msg.eventType === EventType.ACCOUNT_ADDED ||
            msg.eventType === EventType.ACCOUNT_REMOVED
        )
      )
      .subscribe((result: EventMessage) => {
        if (this.#msalService.instance.getAllAccounts().length === 0) {
          // No accounts - navigate to root
          this.#router.navigate(['/']);
        } else {
          // Accounts - navigate to default URL
          this.#router.navigate([environment.msalConfig.defaultUrl]);
        }
      });

    this.#msalBroadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) => status === InteractionStatus.None
        ),
        takeUntil(this.#destroying$)
      )
      .subscribe(() => {
        this.checkAndSetActiveAccount();
      });
  }

  #msalGuardConfig = MSALGuardConfigFactory();
  #msalService = inject(MsalService);
  #msalBroadcastService = inject(MsalBroadcastService);

  #router = inject(Router);
  #destroying$ = new Subject<void>();

  user = signal<User | null>(null);
  authToken = signal<string | null>(null);
  isLoggedIn = computed(() => this.user() != null);

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.#destroying$.next(undefined);
    this.#destroying$.complete();
  }

  /**
   * If no active account set but there are accounts signed in, sets first account to active account
   * To use active account set here, subscribe to inProgress$ first in your component
   * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
   */
  checkAndSetActiveAccount() {
    let activeAccount = this.#msalService.instance.getActiveAccount();

    if (!activeAccount && this.#msalService.instance.getAllAccounts().length > 0
    ) {
      let accounts = this.#msalService.instance.getAllAccounts();
      this.#msalService.instance.setActiveAccount(accounts[0]);
    }
  }

  loginRedirect() {
    if (this.#msalGuardConfig.authRequest) {
      this.#msalService.loginRedirect({
        ...this.#msalGuardConfig.authRequest,
      } as RedirectRequest);
    } else {
      this.#msalService.loginRedirect();
    }
  }

  loginPopup() {
    if (this.#msalGuardConfig.authRequest) {
      this.#msalService
        .loginPopup({ ...this.#msalGuardConfig.authRequest } as PopupRequest)
        .subscribe((response: AuthenticationResult) => {
          this.#msalService.instance.setActiveAccount(response.account);
        });
    } else {
      this.#msalService
        .loginPopup()
        .subscribe((response: AuthenticationResult) => {
          this.#msalService.instance.setActiveAccount(response.account);
        });
    }
  }
}

export type User = {
  username: string
}