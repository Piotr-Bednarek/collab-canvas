import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { browserLocalPersistence, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';

import { Auth, signInWithRedirect } from '@angular/fire/auth';
import { collection, collectionData, CollectionReference, Firestore } from '@angular/fire/firestore';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

import { DomSanitizer } from '@angular/platform-browser';
import { addDoc, doc, setDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';

const GOOGLE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>`;

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [MatButtonModule, MatIconModule],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit {
    private auth: Auth = inject(Auth);
    private firestore: Firestore = inject(Firestore);

    usersCollection: CollectionReference = collection(this.firestore, 'users');

    users$: Observable<User[]> = new Observable<User[]>();
    user$: User | null = null;

    constructor(private router: Router, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
        // console.log('User:', this.user$);

        iconRegistry.addSvgIconLiteral('google-icon', sanitizer.bypassSecurityTrustHtml(GOOGLE_ICON));
    }

    ngOnInit(): void {
        this.users$ = collectionData(this.usersCollection) as Observable<User[]>;
        this.user$ = this.auth.currentUser;

        this.auth
            .setPersistence(browserLocalPersistence)
            .then(() => {
                console.log('Persistence set.');
            })
            .catch((error) => {
                console.error('Persistence failed:', error);
            });

        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.user$ = user;
                console.log('User:', this.user$);
                this.redirectToProfile();
            } else {
                this.user$ = null;
            }
        });
    }

    login() {
        console.log('Logging in...');
        signInWithPopup(this.auth, new GoogleAuthProvider())
            .then((result) => {
                console.log('Logged in:', this.user$);

                this.addUserProfile();

                // this.router.navigate(['/profile']);
            })
            .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                console.error('Login failed:', errorCode, errorMessage);
            });
    }

    logout() {
        console.log('Logging out...');
        this.auth.signOut().then(() => {
            console.log('Logged out.');
            this.user$ = null;
        });
    }

    async addUserProfile() {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return;

        console.log('Adding user profile:', currentUser);

        const userDocRef = doc(this.usersCollection, currentUser.uid);

        await setDoc(userDocRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
        })
            .then(() => {
                console.log('User profile added.');
                this.redirectToProfile();
            })
            .catch((error) => {
                console.error('Error adding user profile:', error);
            });

        // addDoc(this.usersCollection, { uid: this.user$.uid });
    }

    redirectToProfile() {
        this.router.navigate(['/profile']);
    }
}
