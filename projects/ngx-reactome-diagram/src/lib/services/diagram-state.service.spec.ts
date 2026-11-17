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

  // Issue #14, bug 5.
  it('resets a state the address no longer has', async () => {
    const selected: unknown[] = [];
    service.onChange.select$.subscribe((select) => selected.push(select));
    await router.navigateByUrl('/?select=R-HSA-1');
    expect(service.get('select')).toBe('R-HSA-1');
    await router.navigateByUrl('/');
    expect(service.get('select')).toBe('');
    expect(selected.at(-1)).toBe('');
  });

  it("keeps the host's other parameters and its fragment when it writes", async () => {
    await router.navigateByUrl('/?host=1#part');
    service.set('select', 'R-HSA-2');
    await vi.waitFor(() => expect(router.url).toContain('select=R-HSA-2'));
    expect(router.url).toBe('/?host=1&select=R-HSA-2#part');
  });

  it('removes a parameter it clears under any of its names, and only those', async () => {
    await router.navigateByUrl('/?FLG=PKM&host=1');
    expect(service.get('flag')).toEqual(['PKM']);
    service.set('flag', []);
    await vi.waitFor(() => expect(router.url).not.toContain('FLG'));
    expect(router.url).toContain('host=1');
    expect(service.get('flag')).toEqual([]);
  });

  it('resets nothing from the address while the router is blocked', async () => {
    service.blockRouterChange = true;
    service.set('select', 'R-HSA-2');
    await router.navigateByUrl('/?host=1');
    expect(service.get('select')).toBe('R-HSA-2');
  });

  // What each parameter holds, as typed (T005): a list is read as items,
  // numbers as numbers; anything else is the address's text.
  it('reads a path as a list and the other parameters as text', async () => {
    await router.navigateByUrl('/?PATH=R-HSA-1,123&FLGINT=true&overlay=x&ANALYSIS=t&select=5');
    expect(service.get('path')).toEqual(['R-HSA-1', 123]);
    expect(service.get('flagInteractors')).toBe('true');
    expect(service.get('overlay')).toBe('x');
    expect(service.get('analysis')).toBe('t');
    expect(service.get('select')).toBe('5');
  });

  it('writes a set value and leaves out one that is empty, false, 0 or null', async () => {
    await router.navigateByUrl('/?FLGINT=true&host=1');
    service.set('flagInteractors', false);
    service.set('select', 0);
    service.set('path', ['R-HSA-1', 2]);
    service.set('analysis', null);
    await vi.waitFor(() => expect(router.url).toContain('path='));
    expect(router.url).toBe('/?host=1&path=R-HSA-1,2');
  });
});
