import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcedureFormComponent } from './procedure-form.component';

describe('ProcedureFormComponent', () => {
  let component: ProcedureFormComponent;
  let fixture: ComponentFixture<ProcedureFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcedureFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcedureFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
