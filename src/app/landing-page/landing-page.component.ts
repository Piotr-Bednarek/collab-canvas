import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CanvasPageComponent } from '../canvas-page/canvas-page.component';
import { LoginPageComponent } from '../login-page/login-page.component';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        LoginPageComponent,
        CanvasPageComponent,
    ],
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {}
