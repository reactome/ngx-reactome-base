import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, distinctUntilChanged, map, Observable} from "rxjs";
import {isArray} from "lodash";


export interface UrlParam<T> {
  value: T
  otherTokens?: string[]
}

export type State = {
  [token: string]: UrlParam<any>
  select: UrlParam<(string | number)>
  flag: UrlParam<(string | number)[]>
  path: UrlParam<string[]>
  flagInteractors: UrlParam<boolean>
  overlay: UrlParam<string | null>
  analysis: UrlParam<string | null>
  analysisProfile: UrlParam<string | null>
};

type ObservableState = { [K in keyof State as `${K & string}$`]: Observable<State[K]['value']> };

@Injectable({
  providedIn: 'root'
})
export class DiagramStateService {

  private ignore = false;
  blockRouterChange = false;

  private state: State = {
    select: {otherTokens: ['SEL'], value: ''},
    flag: {otherTokens: ['FLG'], value: []},
    path: {otherTokens: ['PATH'], value: []},
    flagInteractors: {otherTokens: ['FLGINT'], value: false},
    overlay: {value: ''},
    analysis: {value: null, otherTokens: ['ANALYSIS']},
    analysisProfile: {value: null},
  };

  private _state$ = new BehaviorSubject<State>(this.state);
  public state$ = this._state$.asObservable();
  public onChange: ObservableState = Object.keys(this.state)
  .reduce((properties, prop: keyof State) => {
    properties[`${prop}$`] = this.state$.pipe(
      map(state => state[prop].value),
      distinctUntilChanged((v1, v2) => v1?.toString() === v2?.toString()),
      // share()
    )
    return properties;
  }, {} as ObservableState);

  constructor(route: ActivatedRoute, private router: Router) {
    route.queryParamMap.subscribe(params => {
      if (this.ignore) return;
      let change = false;
      for (const mainToken in this.state) {
        const param = this.state[mainToken];
        const tokens: string[] = [mainToken, ...param.otherTokens || []];
        const token = tokens.find(token => params.has(token));
        if (token) {
          const formerValue = param.value;
          if (isArray(param.value)) {
            const rawValue = params.get(token)!;
            // A database id is a number; anything else, such as a gene name, a string.
            param.value = rawValue.split(',').map(v => /^\d+$/.test(v) ? parseInt(v) : v);
          } else {
            param.value = params.get(token)!;
          }
          // Changed when it differs from before. This was inverted, so a state
          // read from the address reached no one and an unchanged one did.
          change = change || formerValue?.toString() !== param.value?.toString();
        }
      }
      if (change) this._state$.next(this.state);
    });
  }

  get<T extends keyof State>(token: T): State[T]['value'] {
    return this.state[token].value
  }

  set<T extends keyof State>(token: T, value: State[T]['value']): void {
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

  onPropertyModified() {
    return this.router.navigate([], {
      queryParams: {
        ...Object.entries(this.state)
          .filter(([_token, param]) => param.value && param.value.length !== 0)
          .reduce((acc, [token, param]) => ({
            ...acc,
            [token]: Array.isArray(param.value) ? param.value.join(',') : param.value
          }), {})
      }
    })
  }


}
