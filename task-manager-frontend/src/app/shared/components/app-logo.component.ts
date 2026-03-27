import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="logo-wrap">

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 124 124"
           fill="none" stroke-linecap="round" stroke-linejoin="round">
        <defs>
          <!-- Clipboard gradient: light purple → deep purple -->
          <linearGradient id="clipGrad" x1="6" y1="8" x2="84" y2="106"
                          gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stop-color="#c084fc"/>
            <stop offset="100%" stop-color="#7c3aed"/>
          </linearGradient>

          <!-- Gear gradient: deep purple → blue -->
          <linearGradient id="gearGrad" x1="80" y1="80" x2="120" y2="120"
                          gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stop-color="#7c3aed"/>
            <stop offset="100%" stop-color="#60a5fa"/>
          </linearGradient>
        </defs>

        <!-- ── Clipboard body ───────────────────────────────────── -->
        <rect x="6" y="16" width="78" height="90" rx="10"
              stroke="url(#clipGrad)" stroke-width="4"/>

        <!-- ── Clip tab (top center) ────────────────────────────── -->
        <rect x="27" y="8" width="34" height="18" rx="8"
              stroke="url(#clipGrad)" stroke-width="4"/>

        <!-- ── Checklist item 1 ─────────────────────────────────── -->
        <rect x="16" y="31" width="14" height="14" rx="3"
              stroke="url(#clipGrad)" stroke-width="3"/>
        <polyline points="17,38 21,43 29,33"
                  stroke="url(#clipGrad)" stroke-width="2.5"/>
        <line x1="38" y1="38" x2="74" y2="38"
              stroke="url(#clipGrad)" stroke-width="3"/>

        <!-- ── Checklist item 2 ─────────────────────────────────── -->
        <rect x="16" y="55" width="14" height="14" rx="3"
              stroke="url(#clipGrad)" stroke-width="3"/>
        <polyline points="17,62 21,67 29,57"
                  stroke="url(#clipGrad)" stroke-width="2.5"/>
        <line x1="38" y1="62" x2="74" y2="62"
              stroke="url(#clipGrad)" stroke-width="3"/>

        <!-- ── Checklist item 3 ─────────────────────────────────── -->
        <rect x="16" y="79" width="14" height="14" rx="3"
              stroke="url(#clipGrad)" stroke-width="3"/>
        <polyline points="17,86 21,91 29,81"
                  stroke="url(#clipGrad)" stroke-width="2.5"/>
        <line x1="38" y1="86" x2="74" y2="86"
              stroke="url(#clipGrad)" stroke-width="3"/>

        <!-- ── Gear (8-tooth, overlapping bottom-right corner) ──── -->
        <!-- Tooth polygon: outer-r=20, inner-r=13, centre=(100,100) -->
        <polygon
          points="
            120,100  112,105  114.1,114.1  105,112
            100,120   95,112   85.9,114.1   88,105
             80,100   88, 95   85.9, 85.9   95, 88
            100, 80  105, 88  114.1, 85.9  112, 95"
          stroke="url(#gearGrad)" stroke-width="3"/>

        <!-- Gear centre hole -->
        <circle cx="100" cy="100" r="7"
                stroke="url(#gearGrad)" stroke-width="3"/>
      </svg>

      <span class="app-name">Task Manager App</span>
    </div>
  `,
  styles: [`
    .logo-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    svg {
      width: 86px;
      height: 86px;
      filter: drop-shadow(0 2px 14px rgba(124, 58, 237, 0.5));
    }

    .app-name {
      font-size: 17px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.4px;
    }
  `],
})
export class AppLogoComponent {}

