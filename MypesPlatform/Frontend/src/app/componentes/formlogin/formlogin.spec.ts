import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Formlogin } from './formlogin';

describe('Formlogin', () => {
  let component: Formlogin;
  let fixture: ComponentFixture<Formlogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Formlogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Formlogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
