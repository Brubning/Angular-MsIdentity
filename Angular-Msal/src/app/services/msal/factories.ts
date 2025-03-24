import {
    BrowserCacheLocation,
    InteractionType,
    IPublicClientApplication,
    LogLevel,
    PublicClientApplication
} from '@azure/msal-browser';

import {
    MsalGuardConfiguration,
    MsalInterceptorConfiguration,
} from '@azure/msal-angular';

import {
    environment
} from '../../../environments/environment';

/**
 * Logger callback for MSAL interactions
 */
export function loggerCallback(logLevel: LogLevel, message: string) {
    console.log(message);
  }

/**
 * 
 * @returns IPublicClientApplication
 */
export function MSALInstanceFactory(): IPublicClientApplication {
    
    return new PublicClientApplication({
        auth: {
            clientId: environment.msalConfig.auth.clientId,
            authority: environment.msalConfig.auth.authority,
            redirectUri: '/',
            postLogoutRedirectUri: '/'
        },
        cache: {
            cacheLocation: BrowserCacheLocation.SessionStorage
        },
        system: {
            allowPlatformBroker: false, // Disables WAM Broker
            loggerOptions: {
                loggerCallback,
                logLevel: environment.msalConfig.logLevel,
                piiLoggingEnabled: false
            }
        }
    });
}

/**
 * 
 * @returns MsalInterceptorConfiguration
 */
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
    const protectedResourceMap = new Map<string, Array<string>>();
    protectedResourceMap.set( environment.azureUri, [...environment.msalConfig.auth.scopes] );
    protectedResourceMap.set( environment.apiUri, [...environment.msalConfig.auth.scopes]);
  
    return {
      interactionType: InteractionType.Redirect,
      protectedResourceMap: protectedResourceMap
    };
  }

  /**
   * 
   * @returns MsalGuardConfiguration
   */
  export function MSALGuardConfigFactory(): MsalGuardConfiguration {
    return {
      interactionType: InteractionType.Redirect,
      authRequest: {
        scopes: [...environment.msalConfig.auth.scopes],
      },
      loginFailedRoute: 'home',
    };
  }