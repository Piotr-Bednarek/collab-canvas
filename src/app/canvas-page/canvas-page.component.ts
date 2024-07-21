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
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { Canvas } from '../../classes/Canvas';
import { DrawingFirebase } from '../drawing-firebase';
import { Drawing } from '../interfaces';

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

        console.log('Adjusting canvas size');

        this.adjustCanvasSize();

        this.canvas = new Canvas([], this.canvasElementRef!, this.context!);

        this.canvas.onDrawingComplete.subscribe((drawing: Drawing) => {
            let temporaryDrawing: DrawingFirebase = {
                selectedBy: null,
                points: drawing.points,
            };
            console.log('Drawing complete:', temporaryDrawing);
            this.addToFirebase(temporaryDrawing);
            // console.log('Drawing complete:', drawing);
        });

        this.canvas.draw();
    }

    ngOnDestroy(): void {
        throw new Error('Method not implemented.');
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
    async addToFirebase(drawing: DrawingFirebase) {
        if (!this.user) {
            console.log('Cannot add new drawing to canvas, no user logged in.');
            return;
        }
        console.log('Adding to Firebase...');

        const canvasCollection = collection(
            this.firestore,
            `users/${this.user.uid}/canvases/${this.canvasId}/drawings`
        );

        const convertedDrawing = {
            ...drawing,
            points: drawing.points.map((point) => ({ x: point.x, y: point.y })),
        };

        await addDoc(canvasCollection, convertedDrawing);
    }

    async fetchFromFirebase() {
        if (!this.user) {
            console.log('Cannot fetch drawings from canvas, no user logged in.');
            return;
        }

        const canvasCollection = collection(
            this.firestore,
            `users/${this.user.uid}/canvases/${this.canvasId}/drawings`
        );

        const querySnapshot = await getDocs(canvasCollection);
        querySnapshot.forEach((doc) => {
            console.log(doc.id, ' => ', doc.data());
        });
    }
}
