import { coerceStringArray } from '@angular/cdk/coercion';
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
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    QuerySnapshot,
    setDoc,
    Unsubscribe,
    updateDoc,
} from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { Canvas } from '../../../classes/Canvas';
import { FirebaseDrawing } from '../../firebase-drawing';
import { Drawing } from '../../interfaces/interfaces';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';
import { SelectedTool } from '../../interfaces/selected-tool';

@Component({
    selector: 'app-canvas-page',
    standalone: true,
    imports: [MatIconModule, MatButtonModule, RouterOutlet, RouterLink, ToolbarComponent],
    templateUrl: './canvas-page.component.html',
    styleUrl: './canvas-page.component.scss',
})
export class CanvasPageComponent implements AfterViewInit, OnDestroy {
    private auth: Auth = inject(Auth);
    private firestore: Firestore = inject(Firestore);

    user$ = user(this.auth);
    userSubscription: Subscription;
    user: User | null = null;

    drawingSubscription: Unsubscribe;

    constructor(private route: ActivatedRoute) {
        this.userSubscription = this.user$.subscribe((aUser: User | null) => {
            if (aUser) {
                this.user = aUser;
                // console.log('User:', aUser);
                // this.fetchFromFirebase();
            } else {
                console.log('No user is currently logged in.');
            }
        });

        this.drawingSubscription = () => {};

        // const canvasCollection = collection(this.firestore, 'canvases', this.canvasId);

        // console.log('Canvas collection:', canvasCollection);
    }

    @ViewChild('canvas') canvasElementRef: ElementRef<HTMLCanvasElement> | undefined;
    @ViewChild('wrapper') wrapperElementRef: ElementRef<HTMLCanvasElement> | undefined;

    canvasId: string | null = null;

    private context: CanvasRenderingContext2D | null = null;

    canvas: Canvas | null = null;

    private lastMouseMoveEvent: MouseEvent | null = null;
    isThrottled: any;

    // private isDrawing: boolean = false;
    // private isMoving: boolean = false;

    // selectedTool = 'move'; // 'draw' or 'move'

    lastAddedDrawingId: string | null = null;

    onToolSelected(tool: string): void {
        // this.selectedTool = tool;
        this.canvas?.setTool(tool as SelectedTool);
    }

    ngAfterViewInit(): void {
        this.canvasId = this.route.snapshot.paramMap.get('id');

        if (!this.canvasId) {
            console.log('CanvasId is not defined.');
            return;
        }

        this.adjustCanvasSize();
        this.canvas = new Canvas(this.canvasElementRef!, this.context!);

        // this.canvas = new Canvas(
        //     drawings: [],
        //     canvasElementRef: this.canvasElementRef!,
        //     context: this.context!,
        // );

        this.canvas.onDrawingComplete.subscribe((drawing: Drawing) => {
            let temporaryDrawing: FirebaseDrawing = {
                id: drawing.id,
                selectedBy: null,
                points: drawing.points,
            };

            this.lastAddedDrawingId = temporaryDrawing.id;

            console.log('Drawing complete:', temporaryDrawing);
            this.addToFirebase(temporaryDrawing);
        });

        this.canvas.onDrawingUpdate.subscribe((selectedDrawing: Drawing) => {
            let temporaryDrawing: FirebaseDrawing = {
                id: selectedDrawing.id,
                selectedBy: this.user?.uid || null,
                points: selectedDrawing.points,
            };

            console.log('Drawing updated:', temporaryDrawing);
            this.updateFirebaseDrawing(temporaryDrawing);
        });

        this.canvas.onClearSelect.subscribe((selectedDrawing: Drawing) => {
            let temporaryDrawing: FirebaseDrawing = {
                id: selectedDrawing.id,
                selectedBy: null,
                points: selectedDrawing.points,
            };

            console.log('SelectedBy cleared:', temporaryDrawing);
            this.updateFirebaseDrawing(temporaryDrawing);
        });

        this.drawingSubscription = onSnapshot(
            collection(this.firestore, `canvases/${this.canvasId}/drawings`),
            (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    // console.log('Change:', change);
                    if (change.type === 'added') {
                        console.log('New drawing: ', change.doc.data());
                        this.fetchDrawingFromFirebase(change.doc.id);
                    }
                    if (change.type === 'modified') {
                        console.log('Modified drawing: ', change.doc.data());

                        this.handleDrawingUpdate(change.doc.data() as FirebaseDrawing);
                        // Handle the modified drawing
                    }
                    // if (change.type === 'removed') {
                    //     console.log('Removed drawing: ', change.doc.data());
                    //     // Handle the removed drawing
                    // }
                });
            },
            (error) => {
                console.error('Error in snapshot listener:', error);
            }
        );
    }

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        this.drawingSubscription();
    }

    handleDrawingUpdate(drawing: FirebaseDrawing) {
        console.log('Updating drawing...');

        this.canvas?.updateDrawing(drawing);
    }

    // fetchCanvas() {
    //     console.log('Fetching canvas...');
    // }

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
        if (!this.canvas) return;

        this.canvas.handleMouseMove($event);

        this.canvas.draw();
    }

    onMouseDown($event: MouseEvent) {
        if (!this.canvas) return;

        this.canvas.handleMouseDown($event);
    }

    onMouseUp($event: MouseEvent) {
        if (!this.canvas) return;

        this.canvas.handleMouseUp($event);
    }

    onWheel($event: WheelEvent) {
        // console.log('Wheel event:', $event);
        if (!this.canvas) return;

        if ($event.ctrlKey) {
            this.canvas.handleCtrlWheel($event);
            return;
        }

        if ($event.shiftKey) {
            // this.canvas.handleShiftWheel($event);
            return;
        }

        // this.canvas.handleWheel($event);
    }

    preventCtrlZoom($event: WheelEvent) {
        if ($event.ctrlKey) {
            $event.preventDefault();
        }
    }

    // onClick($event: MouseEvent) {
    // return;
    // if (this.selectedTool === 'draw') return;
    // this.handleMouseSelect();
    // }

    handleCursorModeSwitch() {
        // this.selectedTool = this.selectedTool === 'move' ? 'draw' : 'move';
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

        this.canvas.draw();
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

            // console.log('Canvas adjusted to wrapper size: ', rect.width, rect.height);
        }

        this.canvas?.draw();
    }

    selectTool(tool: string) {
        console.log('Selected tool:', tool);
        // this.selectedTool = tool;
    }

    getSelectedTool(): SelectedTool {
        if (!this.canvas) return 'draw';

        return this.canvas.getSelectedTool();
    }

    getZoomValue(): string {
        if (!this.canvas) return '100%';

        const zoomValue = parseFloat(this.canvas.getZoomValue()) * 100;
        const roundedZoomValue = parseFloat(zoomValue.toFixed(2)); // Convert to number to remove trailing .00
        const zoomString = roundedZoomValue + '%';

        return zoomString;
    }

    resetCanvasScale() {
        if (!this.canvas) return;

        this.canvas.resetScale();
    }

    canvasZoomOut() {
        if (!this.canvas) return;

        this.canvas.zoomOut();
    }

    canvasZoomIn() {
        if (!this.canvas) return;

        this.canvas.zoomIn();
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
            // console.log(doc.id, ' => ', doc.data());
            this.canvas?.handleFirebaseDrawing(doc.data() as FirebaseDrawing);
        });

        this.canvas?.draw();
    }

    async fetchDrawingFromFirebase(drawingId: string) {
        if (!this.user) {
            console.log('Cannot fetch drawing from canvas, no user logged in.');
            return;
        }

        if (drawingId === this.lastAddedDrawingId) return;

        const canvasCollection = collection(this.firestore, `/canvases/${this.canvasId}/drawings`);

        await getDoc(doc(canvasCollection, drawingId)).then((doc) => {
            this.canvas?.handleFirebaseDrawing(doc.data() as FirebaseDrawing);
        });

        // const querySnapshot = await getDocs(canvasCollection);
        // querySnapshot.forEach((doc) => {
        //     if (doc.id !== drawingId) return;
        // });

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

        // const docRef = doc(canvasCollection, drawing.id);

        // Check if the document exists before updating
        const docSnap = await getDoc(docRef).catch((error) =>
            console.error('Error getting document:', error)
        );

        // console.log('Document data:', docSnap.data());
        // if (!docSnap.exists()) {
        // console.log('Document does not exist, cannot update.');
        // Optionally, create the document here if it should exist
        // await setDoc(docRef, convertedDrawing, { merge: true });
        // return;
        // }

        const convertedDrawing = {
            id: drawing.id,
            selectedBy: drawing.selectedBy,
            points: drawing.points.map((point) => ({ x: point.x, y: point.y })),
        };

        await updateDoc(docRef, convertedDrawing);
    }

    // @HostListener('window:keydown.1', ['$event'])
    // handlePress1() {
    //     this.onToolSelected('move');
    // }

    // @HostListener('window:keydown.2', ['$event'])
    // handlePress2() {
    //     this.onToolSelected('select');
    // }

    // @HostListener('window:keydown.3', ['$event'])
    // handlePress3() {
    //     this.onToolSelected('draw');
    // }

    // @HostListener('window:keydown.4', ['$event'])
    // handlePress4() {
    //     this.onToolSelected('eraser');
    // }

    @HostListener('contextmenu', ['$event'])
    onRightClick($event: MouseEvent) {
        $event.preventDefault();
    }

    @HostListener('window:resize', ['$event'])
    onResize($event: Event) {
        console.log('Resizing');
        this.adjustCanvasSize();
    }
}
