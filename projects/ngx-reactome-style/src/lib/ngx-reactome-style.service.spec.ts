import { TestBed } from '@angular/core/testing';

import { NgxReactomeStyleService } from './ngx-reactome-style.service';

describe('NgxReactomeStyleService', () => {
  let service: NgxReactomeStyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxReactomeStyleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
