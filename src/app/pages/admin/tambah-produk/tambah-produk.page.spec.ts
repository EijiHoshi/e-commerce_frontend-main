import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TambahProdukPage } from './tambah-produk.page';

describe('TambahProdukPage', () => {
  let component: TambahProdukPage;
  let fixture: ComponentFixture<TambahProdukPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TambahProdukPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
