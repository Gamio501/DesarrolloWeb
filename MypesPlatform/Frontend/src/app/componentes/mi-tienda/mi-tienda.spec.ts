import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiTienda } from './mi-tienda';

describe('MiTienda', () => {
  let component: MiTienda;
  let fixture: ComponentFixture<MiTienda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiTienda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiTienda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
