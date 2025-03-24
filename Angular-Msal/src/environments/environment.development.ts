import { LogLevel } from "@azure/msal-browser";

export const environment = {
    production: false,
    msalConfig: {
      auth: {
        clientId: 'd341ae80-de5f-4b42-90cd-28ac421d64ac',
        authority: 'https://login.microsoftonline.com/de07f869-d720-4cb0-840b-4c3f11f47c42',
        scopes: ['api://d341ae80-de5f-4b42-90cd-28ac421d64ac/Crm.Access', 'openid', 'user.read']
      },
      defaultUrl: 'profile',
      logLevel: LogLevel.Info
    },
    azureUri: 'https://graph.microsoft.com/v1.0/me',
    apiUri: 'http://localhost:5221'
};
