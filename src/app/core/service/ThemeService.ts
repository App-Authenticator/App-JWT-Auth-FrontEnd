import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkModeSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {

    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        this.setTheme(storedTheme === 'dark');
      } else {
        this.setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    } else {
      this.setTheme(false);
    }
  }

  setTheme(isDarkMode: boolean): void {
    this.isDarkModeSubject.next(isDarkMode);

    if (this.isBrowser) {
      const html = document.documentElement;

      if (isDarkMode) {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkModeSubject.value);
  }
}
