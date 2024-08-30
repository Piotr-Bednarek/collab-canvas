import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CanvasPageComponent } from '../canvas-page/canvas-page.component';
import { LoginPageComponent } from '../login-page/login-page.component';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [
        RouterLink,
        LoginPageComponent,
        CanvasPageComponent,
        MatButtonModule,
        MatButtonModule,
        MatTooltip,
    ],
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {}
