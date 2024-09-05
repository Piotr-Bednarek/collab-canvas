import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThicknessButtonComponent } from './thickness-button.component';

describe('ThicknessButtonComponent', () => {
  let component: ThicknessButtonComponent;
  let fixture: ComponentFixture<ThicknessButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThicknessButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThicknessButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
