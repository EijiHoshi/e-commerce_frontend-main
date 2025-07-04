import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PelangganPage } from './pelanggan.page';

describe('PelangganPage', () => {
  let component: PelangganPage;
  let fixture: ComponentFixture<PelangganPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PelangganPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
