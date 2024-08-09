import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, Firestore } from 'firebase/firestore';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private auth: Auth = inject(Auth);
    private firestore: Firestore = inject(Firestore);
    constructor() {}

    async getUser() {
        return this.auth.currentUser;
    }

    async createNewCanvas() {
        const user = await this.getUser();

        if (!user) {
            console.log('Cannot create a new canvas, no user logged in.');
            return;
        }

        const canvasesCollection = collection(this.firestore, 'canvases');

        const newCanvasData = {
            title: 'Untitled Canvas',
            ownerUid: user.uid,
            created: new Date(),
        };

        await addDoc(canvasesCollection, newCanvasData);
    }
}
