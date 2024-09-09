import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { collection, doc, documentId, getDoc, getDocs, query, where } from 'firebase/firestore';
import { CanvasItem } from '../../interfaces/canvases';
import { CanvasEditDialogComponent } from '../canvas-edit-dialog/canvas-edit-dialog.component';
import { CanvasRemoveDialogComponent } from '../canvas-remove-dialog/canvas-remove-dialog.component';

import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-canvas-item',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatExpansionModule,
    ],
    templateUrl: './canvas-item.component.html',
    styleUrl: './canvas-item.component.scss',
})
export class CanvasItemComponent implements AfterViewInit {
    @Output() handleDelete = new EventEmitter<string>();

    @Input() id: string = '';

    data: CanvasItem | undefined;

    updatedTitle = signal<string>('');

    private firestore: Firestore = inject(Firestore);
    readonly dialog = inject(MatDialog);
    private _snackBar = inject(MatSnackBar);

    ngAfterViewInit(): void {
        this.fetchCanvasData();
    }

    async fetchCanvasData() {
        console.log('Fetching canvas data...', this.id);
        try {
            const canvasDocRef = doc(this.firestore, `canvases/${this.id}`);
            const canvasDocSnap = await getDoc(canvasDocRef);

            if (canvasDocSnap.exists()) {
                const canvasData = canvasDocSnap.data();

                if (canvasData) {
                    this.data = {
                        id: this.id,
                        title: canvasData['title'],
                        created: this.getFormattedDate(canvasData['created'].toDate()),
                        owner: canvasData['owner'],
                        collaborators: canvasData['collaborators'],
                    };

                    //update signals
                    this.updatedTitle.set(this.data.title);
                }
            } else {
                console.log('No such document!');
            }
        } catch (error) {
            console.error('Error fetching canvas data:', error);
        }
    }

    handleCanvasEditDialog(event: MouseEvent) {
        event.stopPropagation();

        const dialogRef = this.dialog.open(CanvasEditDialogComponent, {
            data: {
                title: this.updatedTitle(),
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed:', result);
            if (result !== undefined) {
                this.updatedTitle.set(result.title);
                this.data!.title = this.updatedTitle();
            }
        });
    }

    handleCanvasDeleteDialog(event: MouseEvent) {
        event.stopPropagation();

        const dialogRef = this.dialog.open(CanvasRemoveDialogComponent);

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed:', result);

            if (result === 'delete') {
                this.handleDelete.emit(this.id);
            }
        });
    }

    handleCanvasShare(event: MouseEvent) {
        event.stopPropagation();

        console.log('Sharing canvas:', this.id);
        this.openSnackBar('Link copied to clipboard!', 'Close');
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action);
    }

    getFormattedDate(date: Date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }
}
