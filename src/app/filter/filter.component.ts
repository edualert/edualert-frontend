import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent {
  isOpen: boolean;
  @Input() noCount?: boolean;

  constructor() {
    this.isOpen = false;
  }

  toggleIsOpen(event) {
    event.preventDefault();
    this.isOpen = !this.isOpen;
  }
}
