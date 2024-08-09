import { Routes } from '@angular/router';
import { CanvasPageComponent } from './pages/canvas-page/canvas-page.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { UserProfilePageComponent } from './pages/user-profile-page/user-profile-page.component';

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
        path: 'canvas/:id',
        component: CanvasPageComponent,
    },
    {
        path: 'profile',
        component: UserProfilePageComponent,
    },
];
