import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TableColumn} from '../../models/catalog-layouts';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges {

  @Input() tableMetadata: [TableColumn];
  @Input() data: any[];

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ( changes.data ) {
      this.data = changes.data.currentValue;
    }
    if ( changes.tableMetadata ) {
      this.tableMetadata = changes.tableMetadata.currentValue;
    }
  }

}
