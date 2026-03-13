import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  @Output() roleSelected = new EventEmitter<'PM' | 'PD'>();

  selectRole(role: 'PM' | 'PD') {
    this.roleSelected.emit(role);
  }
}
