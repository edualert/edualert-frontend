import { Component, ElementRef, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent {
  @Input() noCount?: boolean = true;  // Setting the default as we don't need the large filter button(for mobile mainly)
  @Input() isDatePickerOpen?: boolean;
  @Input() labelName?: string;
  isOpen: boolean;

  constructor(private elementRef: ElementRef) {
    this.isOpen = false;
  }

  toggleIsOpen(event) {
    event.preventDefault();
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event) {
    if (this.elementRef.nativeElement.contains(event.target)) {
    } else {
      this.isOpen = false;
    }
  }
}
