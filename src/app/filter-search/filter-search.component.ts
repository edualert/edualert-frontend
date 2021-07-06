import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-filter-search',
  templateUrl: './filter-search.component.html',
  styleUrls: ['./filter-search.component.scss']
})
export class FilterSearchComponent implements OnChanges, OnInit {
  @Output() searchSubmit: EventEmitter<string> = new EventEmitter<string>();
  @Input() searchString: string;
  @Input() isWide?: boolean;
  currentSearchString: string;
  isMobile: boolean = false;

  ngOnInit(): void {
    this.checkScreenWidth();
  }

  @HostListener('window:resize', ['$event'])
  checkScreenWidth() {
    this.isMobile = window.innerWidth < 1024;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.currentSearchString = changes.searchString.currentValue;
  }

  formSubmit(event): void {
    event.preventDefault();
    this.searchSubmit.emit(this.currentSearchString);
  }

  clearInput() {
    this.currentSearchString = '';
  }
}
