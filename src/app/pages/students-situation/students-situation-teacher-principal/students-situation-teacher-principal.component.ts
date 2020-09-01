import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PupilStatisticsListOrs} from '../../../models/pupil-statistics-list';

@Component({
  selector: 'app-students-situation-teacher-principal',
  templateUrl: './students-situation-teacher-principal.component.html',
  styleUrls: ['./students-situation-teacher-principal.component.scss']
})
export class StudentsSituationTeacherPrincipalComponent {
  @Input() students: PupilStatisticsListOrs[];
  @Output() onLinkClick: EventEmitter<any> = new EventEmitter<any>();
  catalogLayout = 'students_situation_teacher_principal';
}
