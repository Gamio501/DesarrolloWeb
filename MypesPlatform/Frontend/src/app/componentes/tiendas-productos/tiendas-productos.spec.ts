import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiendasProductos } from './tiendas-productos';

describe('TiendasProductos', () => {
  let component: TiendasProductos;
  let fixture: ComponentFixture<TiendasProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiendasProductos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiendasProductos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
