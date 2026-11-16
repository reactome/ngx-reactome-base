import { DarkService } from './dark.service';

describe('DarkService', () => {
  afterEach(() => {
    localStorage.removeItem('is-dark');
    document.body.classList.remove('dark');
  });

  /** The service made with `stored` in the theme's key. */
  const withStored = (stored: string) => {
    localStorage.setItem('is-dark', stored);
    return new DarkService();
  };

  it('reads a stored true as dark', () => {
    expect(withStored('true').isDark).toBe(true);
  });

  it('reads a stored false as light', () => {
    expect(withStored('false').isDark).toBe(false);
  });

  // The key is a generic name another script on the host page may also write.
  it('reads a stored value that is not JSON as light, rather than failing to start', () => {
    let service: DarkService | undefined;
    expect(() => (service = withStored('dark'))).not.toThrow();
    expect(service?.isDark).toBe(false);
    expect(document.body.classList.contains('dark')).toBe(false);
  });

  it('reads stored JSON that is not a boolean as light', () => {
    for (const stored of ['1', '"true"', '{}', '[true]', 'null']) {
      expect(withStored(stored).isDark, stored).toBe(false);
    }
  });
});
