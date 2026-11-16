import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Whether a theme stored under `is-dark` means dark: only a stored `true` does.
 * The key is a generic name another script on the host page may write, so a value
 * that is not JSON, or not a boolean, reads as light rather than stopping the service.
 */
function storedAsDark(stored: string): boolean {
  try {
    return JSON.parse(stored) === true;
  } catch {
    return false;
  }
}

@Injectable({
  providedIn: 'root',
})
export class DarkService {
  private _body: HTMLBodyElement | null;
  private _isDark: boolean = false;

  private readonly $_dark = new BehaviorSubject(this._isDark);
  public readonly $dark = this.$_dark.asObservable();

  constructor() {
    this._body = document.querySelector('body');

    // Update theme if other tabs are changing it
    // window.addEventListener('storage', (e) => {
    //   if (e.key === 'is-dark') this.isDark = JSON.parse(e.newValue || 'false');
    // });

    const localValue = localStorage.getItem('is-dark');
    if (localValue) this.isDark = storedAsDark(localValue);
    else if (window.matchMedia('(prefers-color-scheme)').media !== 'not all') {
      this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }

  get isDark(): boolean {
    return this._isDark;
  }

  set isDark(value: boolean) {
    this._isDark = value;
    localStorage.setItem('is-dark', JSON.stringify(value));
    if (value) this._body?.classList.add('dark');
    else this._body?.classList.remove('dark');
    this.$_dark.next(this._isDark);
  }
}
