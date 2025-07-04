import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PenjualanPage } from './penjualan.page';

describe('PenjualanPage', () => {
  let component: PenjualanPage;
  let fixture: ComponentFixture<PenjualanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PenjualanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
