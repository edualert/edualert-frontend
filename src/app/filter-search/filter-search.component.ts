import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-filter-search',
  templateUrl: './filter-search.component.html',
  styleUrls: ['./filter-search.component.scss']
})
export class FilterSearchComponent implements OnChanges {
  @Output() searchSubmit: EventEmitter<string> = new EventEmitter<string>();
  @Input() searchString: string;
  @Input() isWide?: boolean;
  currentSearchString: string;

  ngOnChanges(changes: SimpleChanges): void {
    this.currentSearchString = changes.searchString.currentValue;
  }

  formSubmit(event): void {
    event.preventDefault();
    this.searchSubmit.emit(this.currentSearchString);
  }
}
