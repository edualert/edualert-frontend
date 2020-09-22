import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent {
  isOpen: boolean;
  @Input() noCount?: boolean = true;  // Setting the default as we don't need the large filter button(for mobile mainly)

  constructor() {
    this.isOpen = false;
  }

  toggleIsOpen(event) {
    event.preventDefault();
    this.isOpen = !this.isOpen;
  }
}
