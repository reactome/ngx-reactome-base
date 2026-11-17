import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';

export interface UrlParam<T> {
  value: T;
  otherTokens?: string[];
}

// What each parameter holds. Read from the address, a list is its items,
// numbers as numbers, and anything else is the address's text: so a path can
// hold numbers, and `flagInteractors` the text `true` rather than a boolean.
type Values = {
  select: string | number;
  flag: (string | number)[];
  path: (string | number)[];
  flagInteractors: boolean | string;
  overlay: string | null;
  analysis: string | null;
  analysisProfile: string | null;
};

type Token = keyof Values;

export type State = { [K in Token]: UrlParam<Values[K]> };

type ObservableState = { [K in Token as `${K}$`]: Observable<Values[K]> };

const TOKENS: readonly Token[] = [
  'select',
  'flag',
  'path',
  'flagInteractors',
  'overlay',
  'analysis',
  'analysisProfile',
];

// A database id is a number; anything else, such as a gene name, a string.
const list = (raw: string) => raw.split(',').map((v) => (/^\d+$/.test(v) ? parseInt(v) : v));
const text = (raw: string) => raw;

// How each parameter is read from the address.
const READ: { [K in Token]: (raw: string) => Values[K] } = {
  select: text,
  flag: list,
  path: list,
  flagInteractors: text,
  overlay: text,
  analysis: text,
  analysisProfile: text,
};

// What each parameter is when the address does not name it: a new list each
// time, so the state never shares one.
const DEFAULTS: { [K in Token]: () => Values[K] } = {
  select: () => '',
  flag: () => [],
  path: () => [],
  flagInteractors: () => false,
  overlay: () => '',
  analysis: () => null,
  analysisProfile: () => null,
};

@Injectable({
  providedIn: 'root',
})
export class DiagramStateService {
  private router = inject(Router);

  private ignore = false;
  blockRouterChange = false;

  private state: State = {
    select: { otherTokens: ['SEL'], value: '' },
    flag: { otherTokens: ['FLG'], value: [] },
    path: { otherTokens: ['PATH'], value: [] },
    flagInteractors: { otherTokens: ['FLGINT'], value: false },
    overlay: { value: '' },
    analysis: { value: null, otherTokens: ['ANALYSIS'] },
    analysisProfile: { value: null },
  };

  private _state$ = new BehaviorSubject<State>(this.state);
  public state$ = this._state$.asObservable();
  public onChange: ObservableState = {
    select$: this.watch('select'),
    flag$: this.watch('flag'),
    path$: this.watch('path'),
    flagInteractors$: this.watch('flagInteractors'),
    overlay$: this.watch('overlay'),
    analysis$: this.watch('analysis'),
    analysisProfile$: this.watch('analysisProfile'),
  };

  constructor() {
    const route = inject(ActivatedRoute);

    route.queryParamMap.subscribe((params) => {
      if (this.ignore) return;
      let change = false;
      for (const mainToken of TOKENS) {
        change = this.read(mainToken, params) || change;
      }
      if (change) this._state$.next(this.state);
    });
  }

  private watch<K extends Token>(token: K): Observable<Values[K]> {
    return this.state$.pipe(
      map((state) => state[token].value),
      distinctUntilChanged((v1, v2) => v1?.toString() === v2?.toString())
      // share()
    );
  }

  // Reads one parameter from the address, and says whether it changed.
  private read<K extends Token>(mainToken: K, params: ParamMap): boolean {
    const param = this.state[mainToken];
    const tokens: string[] = [mainToken, ...(param.otherTokens || [])];
    const token = tokens.find((token) => params.has(token));
    const raw = token === undefined ? null : params.get(token);
    if (raw !== null) {
      const formerValue = param.value;
      param.value = READ[mainToken](raw);
      // Changed when it differs from before. This was inverted, so a state
      // read from the address reached no one and an unchanged one did.
      return formerValue?.toString() !== param.value?.toString();
    }
    // Gone from the address, so back to its default: it was kept, and a
    // selection or flag removed from the address stayed. Not while the
    // router is blocked, when the address is not where the state lives.
    if (this.blockRouterChange) return false;
    const initial = DEFAULTS[mainToken]();
    if (String(param.value) === String(initial)) return false;
    param.value = initial;
    return true;
  }

  get<T extends Token>(token: T): Values[T] {
    return this.state[token].value;
  }

  set<T extends Token>(token: T, value: Values[T]): void {
    this.state[token].value = value;
    // N.B. by GW: Not sure why this.ignore is here. Nothing changes here!!!
    // Most likely this.ignore = true below
    this.ignore = false;
    if (!this.blockRouterChange) {
      // Subscribers hear of it once the address has it. They used to through
      // the address itself, by way of the inverted change check that read an
      // unchanged value as a change.
      void this.onPropertyModified().then(() => {
        this.ignore = false;
        this._state$.next(this.state);
      });
    }
  }

  // Merged into the host's address: replacing the query string and dropping
  // the fragment took the host's own parameters with them. A parameter with no
  // value is removed, under its aliases too, or an alias left behind would
  // bring the value back on the next read. A list with no items, '', 0, false
  // and null are no value.
  onPropertyModified() {
    const queryParams: Record<string, unknown> = {};
    for (const token of TOKENS) {
      const param = this.state[token];
      const value = param.value;
      const set = Array.isArray(value) ? value.length !== 0 : Boolean(value);
      for (const alias of param.otherTokens ?? []) queryParams[alias] = null;
      queryParams[token] = !set ? null : Array.isArray(value) ? value.join(',') : value;
    }
    return this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      preserveFragment: true,
    });
  }
}
