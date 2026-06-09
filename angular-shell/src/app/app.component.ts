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

    console.log('🎮 UAT Deployed Gamification  -> 09th June 2026 , 13:16 PM');
    console.log('🎮 PROD Deployed Gamification  -> 05th June 2026 , 16:00 PM');
  }
}
