import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasItemComponent } from './canvas-item.component';

describe('CanvasItemComponent', () => {
  let component: CanvasItemComponent;
  let fixture: ComponentFixture<CanvasItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
