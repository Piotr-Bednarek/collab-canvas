import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { Auth, User, user } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Router, RouterModule } from '@angular/router';
import {
    addDoc,
    collection,
    CollectionReference,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbar } from '@angular/material/toolbar';
import { Canvases, CanvasItem } from '../../interfaces/canvases';

import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { CanvasRemoveDialogComponent } from '../../components/canvas-remove-dialog/canvas-remove-dialog.component';
@Component({
    selector: 'app-user-profile-page',
    standalone: true,
    imports: [
        CommonModule,
        MatToolbar,
        MatCardModule,
        RouterModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './user-profile-page.component.html',
    styleUrl: './user-profile-page.component.scss',
})
export class UserProfilePageComponent implements OnDestroy {
    readonly dialog = inject(MatDialog);

    private auth: Auth = inject(Auth);
    private firestore: Firestore = inject(Firestore);

    user$ = user(this.auth);
    userSubscription: Subscription;
    user: User | null = null;

    canvases$: Observable<Canvases>;
    canvasesSubscription: Subscription;
    private canvasesSource = new BehaviorSubject<Canvases>({ loading: true, data: [] });

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

        // this.canvases$ = new Observable<Canvases>();
        this.canvases$ = this.canvasesSource.asObservable();

        this.canvasesSubscription = this.canvases$.subscribe();
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
        const canvasesCollection = collection(this.firestore, 'canvases');

        const newCanvasData = {
            title: 'Untitled Canvas',
            ownerUid: this.user.uid,
            created: new Date(),
        };

        await addDoc(canvasesCollection, newCanvasData);
        await this.fetchUserCanvases();
    }

    async fetchUserCanvases() {
        if (!this.user) {
            console.log('Cannot fetch canvases, no user logged in.');
            return;
        }

        const canvasesCollection = collection(this.firestore, `canvases`);
        const canvasesQuery = query(canvasesCollection, where('ownerUid', '==', this.user.uid));

        const querySnapshot = await getDocs(canvasesQuery);

        this.canvasesSource.next({ loading: true, data: [] });
        querySnapshot.forEach((doc) => {
            const canvasData: CanvasItem = {
                id: doc.id,
                title: doc.data()['title'],
                ownerUid: doc.data()['ownerUid'],
                created: this.getFormattedDate(doc.data()['created'].toDate()),
            };

            this.canvasesSource.next({
                loading: true,
                data: [...this.canvasesSource.value.data, canvasData],
            });

            // console.log('Canvas:', canvasData);
        });

        this.canvasesSource.next({
            loading: false,
            data: this.canvasesSource.value.data,
        });
    }

    handleRoutingToCanvas(canvasId: string) {
        console.log('Routing to canvas:', canvasId);
        this.router.navigate(['/canvas', canvasId]);
    }

    getFormattedDate(date: Date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    handleCanvasDeleteDialog(canvasId: string, event: MouseEvent) {
        event.stopPropagation();

        const dialogRef = this.dialog.open(CanvasRemoveDialogComponent);

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed:', result);

            if (result === 'delete') {
                this.handleCanvasDelete(canvasId);
            }
        });
    }

    async handleCanvasDelete(canvasId: string) {
        if (!this.user) {
            console.log('Cannot delete canvas, no user logged in.');
            return;
        }

        console.log('Deleting canvas:', canvasId);

        const canvasRef = doc(this.firestore, `canvases/${canvasId}`);

        await deleteDoc(canvasRef);

        this.fetchUserCanvases();
    }

    async signOut() {
        await this.auth.signOut();

        this.router.navigate(['/login']);
    }
}
