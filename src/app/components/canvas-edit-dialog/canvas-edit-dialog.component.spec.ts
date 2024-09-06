import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasEditDialogComponent } from './canvas-edit-dialog.component';

describe('CanvasEditDialogComponent', () => {
  let component: CanvasEditDialogComponent;
  let fixture: ComponentFixture<CanvasEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
