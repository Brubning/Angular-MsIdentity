import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
    {
        path: "profile",
        component: ProfileComponent,
        canActivate: [MsalGuard]
    },
    {
        path: "home",
        component: HomeComponent
    },
    {
        path: "**",
        component: HomeComponent
    }
];
