# Angular-MsIdentity
Worked example of Angular MSAL and WebAPI MS Identity integration for authentication with Microsoft Entra ID.

## Create a Registered Application

The registered application creates the logical end-point that controls authentication of users against the Entra ID directory.

1. Login to *Microsoft Entra admin center*
2. Expand *Applications* and click *App registrations* and then *New registration*
3. Set up the registration
    1. Name e.g. vc-crm-dev
    2. Supported account types e.g. Accounts in this organizational directory only
    3. Redirect URI e.g. http://localhost:4200/userprofile
4. Click *Register*

## Expose an API

Exposing the API allows for creation of managed scopes which are used during the authentication and authorization flow to verify claims.

1. In *Microsoft Entra admin center*, go to the relevant *App registration* e.g. *vc-crm-dev*
2. Click *Expose an API*
3. Click *Add a scope*
4. Set up the scope
    1. Scope name e.g. *Crm.Access*
    2. Who can consent? *Admins only*
    3. Admin consent display name e.g. *Crm.Access (Admin)*
    4. Admin consent description
    5. User consent display name e.g. *Crm.Access (User)*
    6. User consent description
5. Click *Add scope*

## Implement MSAL for Angular

Angular uses the MSAL (**M**icro**S**oft **A**uthentication **L**ibrary) for JS. This provides a set of classes including an MSAL instance (co-ordinates authentication flow), interceptor (appends access token to HTTP requests) and guard (protects against unauthenticated access to routes).

MSAL requires the *Directory (tenant) ID*, *Application (client) ID* and scope details from the *App registration*. This allows the front end application to navigate the MS authentication flow (redirect or popup) to obtain an access token (JWT). The access token is then passed as an auth header to the Web API application.

### Code Setup

In the Angular project the key elements are:

1. services/msal/factories.ts - factory methods that provides instances of MSAL, interceptor and guard.
2. app.config.ts - sets up providers for the application including all MSAL classes.
3. services/authentication.service.ts - triggers and watches the MSAL authentication process.

MSAL communicates authentication flow through events which are exposed by the MsalBroadcastService.

### Environment Settings

The *environment.ts* file (and any environment specific versions) includes the following:

```tsx
    msalConfig: {
      auth: {
        clientId: 'd341ae80-de5f-4b42-90cd-28ac421d64ac',
        authority: 'https://login.microsoftonline.com/de07f869-d720-4cb0-840b-4c3f11f47c42',
        scopes: ['api://d341ae80-de5f-4b42-90cd-28ac421d64ac/Crm.Access', 'openid', 'user.read']
      },
      defaultUrl: 'profile',
      logLevel: LogLevel.Info
    },
```

The scopes includes:

1. [*user.read*](http://user.read)  - allows user profile information to be read from the Microsoft graph endpoint (https://graph.microsoft.com/v1.0/me)
2. api://[clientId]/[scope] - identifies the scope for the exposed API and allows WebAPI to validate the signature of an access token from the Angular front end
3. *openid* - [optional] allows default claims against the registration

## Implement MS Identity for [ASP.NET](http://ASP.NET) Core

The [ASP.NET](http://ASP.NET) WebAPI project uses MS Identity (installed by NuGet) to verify the access token provided by the front end application. The access token is JWT encoded and MS Identity will use the token endpoint of the API exposed by the app registration to validate the signature and verify any claims etc. in the token.

### Code Setup

The code uses a standard `[Authorize]` attribute to secure any controller methods. The authorization is set up in the startup code of the WebAPI (see *Program.cs*)

```csharp
// Authentication
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(options =>
    {
        builder.Configuration.Bind("ApiAppRegistration");
        options.TokenValidationParameters.NameClaimType = "name";
    }, options =>
    {
        builder.Configuration.Bind("ApiAppRegistration", options);
    });
// Authorization
builder.Services.AddAuthorization(config =>
{
    config.AddPolicy("AuthPolicy", policy => policy.RequireRole("Crm.Access"));
});
```

### App Settings

The *appsettings.json* file (and any environment specific versions) includes the following:

```tsx
  "ApiAppRegistration": {
    "DisplayName": "vc-crm-dev",
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "de07f869-d720-4cb0-840b-4c3f11f47c42",
    "ClientId": "d341ae80-de5f-4b42-90cd-28ac421d64ac",
    "Scopes": "Crm.Access"
  }
```

The scopes includes *Crm.Access*. This must match a scope defined in the API exposed by the app registration and configured in MSAL. The MSAL configuration provides the fully qualified scope (e.g. *api://d341ae80-de5f-4b42-90cd-28ac421d64ac/Crm.Access*). MS Identity will query the scope using the *Client ID* and *Scope Name*.

## Validate the Access Token

To validate the signature, audience, scopes etc. use https://jwt.io/

## References

https://learn.microsoft.com/en-us/entra/identity-platform/application-model

https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals

https://learn.microsoft.com/en-us/entra/identity-platform/scenario-spa-app-registration#redirect-uri-msaljs-20-with-auth-code-flow

Use MSAL.js 2.0 with auth code flow

https://learn.microsoft.com/en-us/entra/identity-platform/scenario-spa-acquire-token