import { Routes } from '@angular/router';
import { CanvasPageComponent } from './canvas-page/canvas-page.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { UserProfilePageComponent } from './user-profile-page/user-profile-page.component';

export const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent,
    },
    {
        path: 'login',
        component: LoginPageComponent,
    },
    {
        path: 'canvas',
        component: CanvasPageComponent,
    },
    {
        path: 'profile',
        component: UserProfilePageComponent,
    },
];
