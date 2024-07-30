import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { Auth, User, user } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { addDoc, collection, CollectionReference, doc, getDocs, query } from 'firebase/firestore';
import { BehaviorSubject, Subscription } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
    selector: 'app-user-profile-page',
    standalone: true,
    imports: [CommonModule, MatToolbar, MatCardModule],
    templateUrl: './user-profile-page.component.html',
    styleUrl: './user-profile-page.component.scss',
})
export class UserProfilePageComponent implements OnDestroy {
    private auth: Auth = inject(Auth);
    private firestore: Firestore = inject(Firestore);

    user$ = user(this.auth);
    userSubscription: Subscription;

    private canvasesSource = new BehaviorSubject<any[]>([]);
    canvases$ = this.canvasesSource.asObservable();

    canvasesSubscription: Subscription;

    user: User | null = null;

    canvasCollection: CollectionReference = collection(this.firestore, `users/${this.user?.uid}/canvases}`);

    constructor(private router: Router) {
        this.userSubscription = this.user$.subscribe((aUser: User | null) => {
            if (aUser) {
                this.user = aUser;
                console.log('User:', aUser);
                this.fetchUserCanvases();
            } else {
                console.log('No user is currently logged in.');
            }
        });

        this.canvasesSubscription = this.canvases$.subscribe((canvases: any) => {
            console.log('Canvases:', canvases);
        });
    }

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        this.canvasesSubscription.unsubscribe();
    }

    async createNewCanvas() {
        if (!this.user) {
            console.log('Cannot create a new canvas, no user logged in.');
            return;
        }

        console.log('Creating a new canvas...');

        const userCanvasesCollection = collection(this.firestore, `users/${this.user.uid}/canvases`);

        const newCanvasRef = doc(userCanvasesCollection);

        const newCanvasData = {
            title: 'Untitled Canvas',
            // description: 'A new canvas.',
            created: new Date(),
            // updated: new Date(),
        };

        await addDoc(userCanvasesCollection, newCanvasData);

        this.fetchUserCanvases();
    }

    async fetchUserCanvases() {
        if (!this.user) {
            console.log('Cannot fetch canvases, no user logged in.');
            return;
        }

        const userCanvasesCollection = collection(this.firestore, `users/${this.user.uid}/canvases`);
        const userCanvasesQuery = query(userCanvasesCollection);
        const querySnapshot = await getDocs(userCanvasesQuery);
        const canvases: any[] = [];
        querySnapshot.forEach((doc) => {
            const canvasData = { id: doc.id, ...doc.data() };
            canvases.push(canvasData);
        });
        this.canvasesSource.next(canvases);
    }

    handleRoutingToCanvas(canvasId: string) {
        console.log('Routing to canvas:', canvasId);
        this.router.navigate(['/canvas', canvasId]);
    }
}
