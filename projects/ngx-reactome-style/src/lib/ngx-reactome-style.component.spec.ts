import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxReactomeStyleComponent } from './ngx-reactome-style.component';

describe('NgxReactomeStyleComponent', () => {
  let component: NgxReactomeStyleComponent;
  let fixture: ComponentFixture<NgxReactomeStyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxReactomeStyleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NgxReactomeStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
