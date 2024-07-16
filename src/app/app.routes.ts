import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CanvasPageComponent } from './canvas-page/canvas-page.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginPageComponent } from './login-page/login-page.component';

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
];
