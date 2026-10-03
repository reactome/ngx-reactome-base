import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { DiagramStateService } from './diagram-state.service';

describe('DiagramStateService', () => {
  let service: DiagramStateService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    service = TestBed.inject(DiagramStateService);
    router = TestBed.inject(Router);
  });

  it('reads what to flag from the address, numbers as numbers', async () => {
    await router.navigateByUrl('/?FLG=PKM,123');
    expect(service.get('flag')).toEqual(['PKM', 123]);
  });

  it('tells its subscribers when the address changes the state', async () => {
    const flagged: unknown[] = [];
    service.onChange.flag$.subscribe((flag) => flagged.push(flag));
    await router.navigateByUrl('/?FLG=PKM');
    expect(flagged.at(-1)).toEqual(['PKM']);
  });

  it('does not tell them when the address leaves the state as it was', async () => {
    let emitted = 0;
    await router.navigateByUrl('/?select=R-HSA-1');
    service.state$.subscribe(() => emitted++);
    await router.navigateByUrl('/?select=R-HSA-1&unrelated=1');
    // Once on subscribing, and not again.
    expect(emitted).toBe(1);
  });
});
