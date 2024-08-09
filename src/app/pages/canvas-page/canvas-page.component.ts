import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    inject,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import { Auth, User, user } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { updatePassword } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { Canvas } from '../../../classes/Canvas';
import { FirebaseDrawing } from '../../firebase-drawing';
import { Drawing } from '../../interfaces';

@Component({
    selector: 'app-canvas-page',
    standalone: true,
    imports: [],
    templateUrl: './canvas-page.component.html',
    styleUrl: './canvas-page.component.scss',
})
export class CanvasPageComponent implements AfterViewInit, OnDestroy {
    private auth: Auth = inject(Auth);
    private firestore: Firestore = inject(Firestore);

    user$ = user(this.auth);
    userSubscription: Subscription;
    user: User | null = null;

    // drawingSubscription: Subscription;

    constructor(private route: ActivatedRoute) {
        this.userSubscription = this.user$.subscribe((aUser: User | null) => {
            if (aUser) {
                this.user = aUser;
                console.log('User:', aUser);
                this.fetchFromFirebase();
            } else {
                console.log('No user is currently logged in.');
            }
        });

        // this.drawingSubscription = new Subscription();
    }

    @ViewChild('canvas') canvasElementRef: ElementRef<HTMLCanvasElement> | undefined;
    @ViewChild('wrapper') wrapperElementRef: ElementRef<HTMLCanvasElement> | undefined;

    canvasId: string | null = null;

    private context: CanvasRenderingContext2D | null = null;

    canvas: Canvas | null = null;

    private lastMouseMoveEvent: MouseEvent | null = null;
    isThrottled: any;

    private isDrawing: boolean = false;
    private isMoving: boolean = false;

    cursorMode = 'move'; // 'draw' or 'move'

    ngAfterViewInit(): void {
        this.canvasId = this.route.snapshot.paramMap.get('id');
        console.log('Canvas ID:', this.canvasId);

        if (!this.canvasId) {
            console.log('CanvasId is not defined.');
            return;
        }

        this.adjustCanvasSize();
        this.canvas = new Canvas([], this.canvasElementRef!, this.context!);

        this.canvas.onDrawingComplete.subscribe((drawing: Drawing) => {
            let temporaryDrawing: FirebaseDrawing = {
                id: drawing.id,
                selectedBy: null,
                points: drawing.points,
            };

            console.log('Drawing complete:', temporaryDrawing);
            this.addToFirebase(temporaryDrawing);
        });

        this.canvas.onDrawingUpdate.subscribe((selectedDrawing: Drawing) => {
            let temporaryDrawing: FirebaseDrawing = {
                id: selectedDrawing.id,
                selectedBy: null,
                points: selectedDrawing.points,
            };

            console.log('Drawing updated:', temporaryDrawing);
            this.updateFirebaseDrawing(temporaryDrawing);
        });

        // const canvasCollectionPath = `users/${this.user.uid}/canvases/${this.canvasId}/drawings`;
        // const canvasCollection = collection(this.firestore, canvasCollectionPath);

        // this.drawingSubscription = onSnapshot(canvasCollection, (snapshot) => {
        //     snapshot.docChanges().forEach((change) => {
        //         if (change.type === 'added') {
        //             console.log('New drawing: ', change.doc.data());
        //             // Handle the new drawing
        //         }
        //         if (change.type === 'modified') {
        //             console.log('Modified drawing: ', change.doc.data());
        //             // Handle the modified drawing
        //         }
        //         if (change.type === 'removed') {
        //             console.log('Removed drawing: ', change.doc.data());
        //             // Handle the removed drawing
        //         }
        //     });
        // });

        this.canvas.draw();
    }

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        // this.drawingSubscription.unsubscribe();
    }

    fetchCanvas() {
        console.log('Fetching canvas...');
    }

    exportCanvas() {
        console.log('Exporting canvas...');
        this.canvas?.exportCanvas();
    }

    onMouseMove($event: MouseEvent) {
        this.lastMouseMoveEvent = $event;
        if (!this.isThrottled) {
            this.isThrottled = true;
            window.requestAnimationFrame(() => {
                this.handleMouseMove(this.lastMouseMoveEvent);
                this.isThrottled = false;
            });
        }
    }

    private handleMouseMove($event: MouseEvent | null) {
        if (!$event) return;

        this.handleMouseHoverCheck($event);
        if (this.cursorMode === 'move') {
            if (!this.isMoving) return;

            this.canvas?.handleMouseMove($event.offsetX, $event.offsetY);
        }

        if (!this.isDrawing) return;

        this.canvas?.addPointToDrawing($event.offsetX, $event.offsetY);

        this.canvas?.drawUnfinished();
    }

    onMouseDown($event: MouseEvent) {
        if (!this.canvas) return;

        if (this.cursorMode === 'move') {
            this.canvas.moveStart($event.offsetX, $event.offsetY);

            this.isMoving = true;
            this.handleMouseHoverCheck($event);
            this.handleMouseSelect();
        } else if (this.cursorMode === 'draw') {
            this.isDrawing = true;
            this.canvas?.handleDrawingSelect();
        }
    }

    onMouseUp($event: MouseEvent) {
        if (this.cursorMode === 'move') {
            this.isMoving = false;
            this.canvas?.handleMouseUp();
        } else if (this.cursorMode === 'draw') {
            if (this.canvas?.addDrawing()) {
                console.log('Drawing added');
                this.isDrawing = false;
            } else {
                this.isDrawing = false;
            }
        }
    }

    onClick($event: MouseEvent) {
        if (this.cursorMode === 'draw') return;

        this.handleMouseSelect();
    }

    handleCursorModeSwitch() {
        this.cursorMode = this.cursorMode === 'move' ? 'draw' : 'move';
    }

    handleMouseHoverCheck($event: MouseEvent) {
        if (!this.canvas) return;

        this.canvas.checkHover($event.offsetX, $event.offsetY);
        this.canvas.checkHoverAnchor($event.offsetX, $event.offsetY);

        this.canvas?.draw();
    }

    handleMouseSelect() {
        if (!this.canvas) return;

        this.canvas.handleDrawingSelect();
        this.canvas.handleAnchorSelect();

        this.canvas?.draw();
    }

    adjustCanvasSize() {
        if (this.wrapperElementRef && this.canvasElementRef && this.wrapperElementRef.nativeElement) {
            const wrapperEl: HTMLElement = this.wrapperElementRef.nativeElement;
            const canvasEl: HTMLCanvasElement = this.canvasElementRef.nativeElement;

            const dpr = window.devicePixelRatio || 1;
            const rect = wrapperEl.getBoundingClientRect();

            canvasEl.style.width = rect.width + 'px';
            canvasEl.style.height = rect.height + 'px';

            canvasEl.width = rect.width * dpr;
            canvasEl.height = rect.height * dpr;

            const context = canvasEl.getContext('2d');
            context?.scale(dpr, dpr);
            this.context = context;

            console.log('Canvas adjusted to wrapper size: ', rect.width, rect.height);
        }

        this.canvas?.draw();
    }

    @HostListener('window:keydown.1', ['$event'])
    changeCursorToDraw() {
        this.cursorMode = 'draw';
    }

    @HostListener('window:keydown.2', ['$event'])
    changeCursorToMove() {
        this.cursorMode = 'move';
    }

    @HostListener('contextmenu', ['$event'])
    onRightClick($event: MouseEvent) {
        $event.preventDefault();
    }

    @HostListener('window:resize', ['$event'])
    onResize($event: Event) {
        console.log('Resizing');
        this.adjustCanvasSize();
    }

    // TODO check if user is authorized to add to this canvas
    async addToFirebase(drawing: FirebaseDrawing) {
        if (!this.user) {
            console.log('Cannot add new drawing to canvas, no user logged in.');
            return;
        }

        console.log('Adding to Firebase...');

        const canvasCollection = collection(this.firestore, `canvases/${this.canvasId}/drawings`);

        const convertedDrawing = {
            ...drawing,
            points: drawing.points.map((point) => ({ x: point.x, y: point.y })),
        };

        await setDoc(doc(canvasCollection, drawing.id), convertedDrawing);

        // console.log('Drawing added to Firebase:', docRef.id);
    }

    async fetchFromFirebase() {
        if (!this.user) {
            console.log('Cannot fetch drawings from canvas, no user logged in.');
            return;
        }

        const canvasCollection = collection(this.firestore, `/canvases/${this.canvasId}/drawings`);

        const querySnapshot = await getDocs(canvasCollection);
        querySnapshot.forEach((doc) => {
            console.log(doc.id, ' => ', doc.data());
            this.canvas?.handleFirebaseDrawing(doc.data() as FirebaseDrawing);
        });

        this.canvas?.draw();
    }

    async updateFirebaseDrawing(drawing: FirebaseDrawing) {
        if (!this.user) {
            console.log('Cannot update drawing in canvas, no user logged in.');
            return;
        }

        // const canvasCollection = collection(
        //     this.firestore,
        //     `users/${this.user.uid}/canvases/${this.canvasId}/drawings`
        // );

        const docRef = doc(this.firestore, `/canvases/${this.canvasId}/drawings/${drawing.id}`);
        // /users/OSP0sx9VFeYmw5r1WjfpzKi3dJ92/canvases/eLLD8txw3SUJAAm8QaNs/drawings/140442c6-a519-4978-bb2d-bb0edd44464b

        // const docRef = doc(canvasCollection, drawing.id);

        // Check if the document exists before updating
        const docSnap = await getDoc(docRef).catch((error) =>
            console.error('Error getting document:', error)
        );

        // console.log('Document data:', docSnap.data());
        // if (!docSnap.exists()) {
        console.log('Document does not exist, cannot update.');
        // Optionally, create the document here if it should exist
        // await setDoc(docRef, convertedDrawing, { merge: true });
        // return;
        // }

        const convertedDrawing = {
            ...drawing,
            points: drawing.points.map((point) => ({ x: point.x, y: point.y })),
        };

        await updateDoc(docRef, convertedDrawing);
    }
}
