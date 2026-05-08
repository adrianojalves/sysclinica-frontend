import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    /* 
     * PrimeNG heavily relies on Angular Animations for opening Modals (Dialogs), 
     * dropping down menus, and sliding panels. We use 'Async' so it only loads 
     * the animation engine when actually needed, improving performance.
     */
    provideAnimationsAsync(),

    /* 
     * Global PrimeNG setup. We are using the modern 'Aura' preset theme as a base.
     * We will use Tailwind CSS later to customize specific colors or layouts.
     */
    providePrimeNG({
        theme: {
            preset: Aura
        }
    }),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
