import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Forbiden } from './forbiden';

describe('Forbiden', () => {
  let component: Forbiden;
  let fixture: ComponentFixture<Forbiden>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Forbiden],
    }).compileComponents();

    fixture = TestBed.createComponent(Forbiden);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
