import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StokPage } from './stok.page';

describe('StokPage', () => {
  let component: StokPage;
  let fixture: ComponentFixture<StokPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StokPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
