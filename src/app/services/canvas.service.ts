import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from 'firebase/firestore';

@Injectable({
    providedIn: 'root',
})
export class CanvasService {
    private auth: Auth = inject(Auth);
    private firestore: Firestore = inject(Firestore);
    constructor() {}
}
