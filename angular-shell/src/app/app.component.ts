import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: [],
})
export class AppComponent implements OnInit {
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
    console.log(`%c${madeByBox}`, 'color: #00ffcc; font-family: monospace; font-weight: bold; background: #05070e;');

    console.log('🎮 UAT Deployed Gamification  -> 03rd June 2026 , 11:56 AM');
    console.log('🎮 PROD Deployed Gamification  -> 25th May 2026 , 17:00 PM');
  }
}
