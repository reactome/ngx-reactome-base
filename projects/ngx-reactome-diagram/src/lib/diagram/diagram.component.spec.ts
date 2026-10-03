import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { DiagramComponent } from './diagram.component';
import { DIAGRAM_CONFIG_TOKEN } from '../services/diagram.service';

describe('DiagramComponent', () => {
  // jsdom has no matchMedia, which the theme reads.
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (media: string) => ({ media, matches: false }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('is created with what it injects', () => {
    TestBed.configureTestingModule({
      imports: [DiagramComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DIAGRAM_CONFIG_TOKEN, useValue: {} },
      ],
    });
    const fixture = TestBed.createComponent(DiagramComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
