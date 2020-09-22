import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ViewUserModalComponent} from '../../pages/manage-users/view-user-modal/view-user-modal.component';
import * as moment from 'moment';
import {PupilLabelsModalComponent} from '../pupil-labels-modal/pupil-labels-modal.component';
import {Student} from '../../models/student';
import {PupilRemarksModalComponent} from '../pupil-remarks-modal/pupil-remarks-modal.component';

@Component({
  selector: 'app-table-cell',
  templateUrl: './table-cell.component.html',
  styleUrls: ['./table-cell.component.scss']
})
export class TableCellComponent implements OnInit {

  @Input() cellType: string;
  @Input() cellIdentifier: string;
  @Input() data: any;
  @Input() navigateTo: string;
  @Input() isExpandable?: boolean;
  @Input() isExpanded?: boolean;
  @Input() pivotPoint: string | number;
  @Input() exceptionRule: string | number;
  @Output() onExpandCell?: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCloseExpand?: EventEmitter<any> = new EventEmitter<any>();
  @Output() onLinkClick?: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('userDetailsModal', {static: false}) userDetailModal: ViewUserModalComponent;
  @ViewChild('viewPupilLabelsModal', {static: false}) viewPupilLabelsModal: PupilLabelsModalComponent;
  @ViewChild('viewRemarksLabelsModal', {static: false}) viewPupilRemarksModal: PupilRemarksModalComponent;
  readonly maxGrades = 4;

  constructor() {
    this.onCellClick = this.onCellClick.bind(this);
  }

  ngOnInit() {
  }

  openTagsModal(studentData: Student): void {
    this.viewPupilLabelsModal.open({labels: studentData});
  }

  openObservationsModal(studentData: Student): void {
    this.viewPupilRemarksModal.open({labels: studentData});
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
