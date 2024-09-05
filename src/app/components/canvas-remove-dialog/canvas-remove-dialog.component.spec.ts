import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasRemoveDialogComponent } from './canvas-remove-dialog.component';

describe('CanvasRemoveDialogComponent', () => {
  let component: CanvasRemoveDialogComponent;
  let fixture: ComponentFixture<CanvasRemoveDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasRemoveDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasRemoveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
