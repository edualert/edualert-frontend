import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ViewUserModalComponent} from '../../pages/manage-users/view-user-modal/view-user-modal.component';
import * as moment from 'moment';
import {PupilLabelsModalComponent} from '../pupil-labels-modal/pupil-labels-modal.component';
import {Student} from '../../models/student';
import {PupilRemarksModalComponent} from '../pupil-remarks-modal/pupil-remarks-modal.component';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-table-cell',
  templateUrl: './table-cell.component.html',
  styleUrls: ['./table-cell.component.scss']
})
export class TableCellComponent {

  @Input() cellType: string;
  @Input() cellIdentifier: string;
  @Input() data: any;
  @Input() navigateTo: string;
  @Input() isExpandable?: boolean;
  @Input() isExpanded?: boolean;
  @Input() pivotPoint: string | number;
  @Input() exceptionRule: string | number;
  @Input() studentCatalogID: string | number;
  @Input() tableLayoutAsIdentifier: string;
  @Input() studentData: any;
  @Input() activeTabId: any;
  @Output() onExpandCell?: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCloseExpand?: EventEmitter<any> = new EventEmitter<any>();
  @Output() onLinkClick?: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('userDetailsModal', {static: false}) userDetailModal: ViewUserModalComponent;
  @ViewChild('viewRemarksLabelsModal', {static: false}) viewPupilRemarksModal: PupilRemarksModalComponent;
  readonly maxGrades = 4;
  classId: number;

  constructor(private activatedRoute: ActivatedRoute) {
    this.onCellClick = this.onCellClick.bind(this);
    this.classId = activatedRoute.snapshot.params?.id;
  }


  openObservationsModal(studentData: Student, studentCatalogId, tableLayout): void {
    this.viewPupilRemarksModal.open(studentData, studentCatalogId, tableLayout);
  }

  onCellClick() {
    if (this.isExpandable) {
      this.onExpandCell.emit();
    }
  }

  xClick(event) {
    event.stopPropagation();
    this.onCloseExpand.emit();
  }

  displayDate(dateString: string) {
    return moment(dateString, 'DD-MM-YYYY').format('DD.MM');
  }

  openUserDetailsModal(id: string | number) {
    this.userDetailModal.open(id);
  }
}
