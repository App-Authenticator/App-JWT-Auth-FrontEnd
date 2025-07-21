// src/app/services/flowbite.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FlowbiteService {
  private flowbiteLoaded = false;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  loadFlowbite(): Promise<any> {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.flowbiteLoaded) {
        return import('flowbite').then((flowbite) => {
          this.flowbiteLoaded = true;
          return flowbite;
        });
      }
      return Promise.resolve(null); 
    }
    return Promise.resolve(null);
  }
}
