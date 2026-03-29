import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { PtBrDateAdapter } from './core/adapters/pt-br-date-adapter';

/** Display dates as dd/MM/yyyy using the native date adapter */
export const PT_BR_DATE_FORMATS = {
  parse:   { dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' } },
  display: {
    dateInput:          { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthYearLabel:     { month: 'short',  year: 'numeric' },
    dateA11yLabel:      { day: 'numeric',  month: 'long',  year: 'numeric' },
    monthYearA11yLabel: { month: 'long',   year: 'numeric' },
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    { provide: LOCALE_ID,       useValue: 'pt-BR' },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: PT_BR_DATE_FORMATS },
    { provide: DateAdapter,     useClass: PtBrDateAdapter },
  ],
};
