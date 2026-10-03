import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DIAGRAM_CONFIG_TOKEN, DiagramService } from './diagram.service';

function setUp(config: unknown) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: DIAGRAM_CONFIG_TOKEN, useValue: config },
    ],
  });
  return {
    service: TestBed.inject(DiagramService),
    http: TestBed.inject(HttpTestingController),
  };
}

describe('DiagramService', () => {
  it('loads a diagram and its graph from the configured address', () => {
    const { service, http } = setUp({ diagramUrl: 'https://example.org/diagram' });
    service.getDiagram('R-HSA-1').subscribe();
    http.expectOne('https://example.org/diagram/R-HSA-1.json');
    http.expectOne('https://example.org/diagram/R-HSA-1.graph.json');
  });

  it('loads from its default address when the configuration does not give one', () => {
    const { service, http } = setUp({});
    service.getDiagram('R-HSA-1').subscribe();
    const requested = http.match(() => true).map((r) => r.request.url);
    expect(requested.length).toBe(2);
    for (const url of requested) expect(url).toMatch(/^https:\/\//);
  });
});
