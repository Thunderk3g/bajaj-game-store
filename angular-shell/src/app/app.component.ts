import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: [],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-shell';

  constructor() { }

  ngOnInit(): void {
    const madeByBox =
      '┌────────────────────────────────────────────────────────┐\n' +
      '│                        MADE BY                         │\n' +
      '├────────────────────────────────────────────────────────┤\n' +
      '│  - Diwakar Adhikari Chetri                             │\n' +
      '│  - Abhishek Gurjar                                     │\n' +
      '│  - Yashraj Lawate                                      │\n' +
      '│  - Utkarsh Das                                         │\n' +
      '│  - Tanish Jagtap                                       │\n' +
      '└────────────────────────────────────────────────────────┘';
    console.log(
      `%c${madeByBox}`,
      'font-family: monospace; font-weight: bold; background: linear-gradient(135deg, #ff007f, #7f00ff, #00f0ff, #ff8a00); color: #ffffff; padding: 4px; border-radius: 4px; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);'
    );

    const deploymentBox =
      '┌────────────────────────────────────────────────────────┐\n' +
      '│                   DEPLOYMENT STATUS                    │\n' +
      '├────────────────────────────────────────────────────────┤\n' +
      '│  UAT  -> 03rd June 2026 , 16:53 PM                     │\n' +
      '│  PROD -> 03rd June 2026 , 17:00 PM                     │\n' +
      '└────────────────────────────────────────────────────────┘';
    console.log(
      `%c${deploymentBox}`,
      'font-family: monospace; font-weight: bold; color: #ffffff; background: #000000; padding: 4px; border-radius: 4px;'
    );
  }

  ngOnDestroy(): void {
  }
}

