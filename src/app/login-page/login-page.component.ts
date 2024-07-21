import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { browserLocalPersistence, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';

import { Auth, signInWithRedirect } from '@angular/fire/auth';
import { collection, collectionData, CollectionReference, Firestore } from '@angular/fire/firestore';

import { addDoc, doc, setDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-login-page',
    standalone: true,
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit {
    private auth: Auth = inject(Auth);
    private firestore: Firestore = inject(Firestore);

    usersCollection: CollectionReference = collection(this.firestore, 'users');

    users$: Observable<User[]> = new Observable<User[]>();
    user$: User | null = null;

    constructor(private router: Router) {
        // console.log('User:', this.user$);
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
            } else {
                this.user$ = null;
            }
        });
    }

    login() {
        console.log('Logging in...');
        signInWithRedirect(this.auth, new GoogleAuthProvider())
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                // const credential = GoogleAuthProvider.credentialFromResult(result);
                // const token = credential.accessToken;
                // The signed-in user info.

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
                this.router.navigate(['/profile']);
            })
            .catch((error) => {
                console.error('Error adding user profile:', error);
            });

        // addDoc(this.usersCollection, { uid: this.user$.uid });
    }
}
