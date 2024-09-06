import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkCopiedSnackBarComponent } from './link-copied-snack-bar.component';

describe('LinkCopiedSnackBarComponent', () => {
  let component: LinkCopiedSnackBarComponent;
  let fixture: ComponentFixture<LinkCopiedSnackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkCopiedSnackBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkCopiedSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
