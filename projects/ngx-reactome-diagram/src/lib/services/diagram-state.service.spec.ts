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

  it('tells its subscribers what it was set to, once the address has it', async () => {
    const selected: unknown[] = [];
    service.onChange.select$.subscribe((select) => selected.push(select));
    service.set('select', 'R-HSA-2');
    await vi.waitFor(() => expect(router.url).toContain('select=R-HSA-2'));
    // The diagram selects every copy of an entity, and fits the view to them,
    // from this -- not from the click that set it.
    await vi.waitFor(() => expect(selected.at(-1)).toBe('R-HSA-2'));
  });

  it('changes neither the address nor its subscribers while the router is blocked', async () => {
    const selected: unknown[] = [];
    service.blockRouterChange = true;
    service.onChange.select$.subscribe((select) => selected.push(select));
    service.set('select', 'R-HSA-2');
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(router.url).not.toContain('select');
    expect(selected).toEqual(['']);
    expect(service.get('select')).toBe('R-HSA-2');
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
