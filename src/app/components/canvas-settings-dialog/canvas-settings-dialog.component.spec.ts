import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasSettingsDialogComponent } from './canvas-settings-dialog.component';

describe('CanvasSettingsDialogComponent', () => {
  let component: CanvasSettingsDialogComponent;
  let fixture: ComponentFixture<CanvasSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasSettingsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
