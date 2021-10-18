import {Component, Input} from '@angular/core';
import {PupilStatisticsListOrs} from '../../../models/pupil-statistics-list';

@Component({
  selector: 'app-students-situation-ors',
  templateUrl: './students-situation-ors.component.html',
  styleUrls: ['./students-situation-ors.component.scss']
})
export class StudentsSituationOrsComponent {
  @Input() students: PupilStatisticsListOrs[];
  @Input() academicYearFilter: string;
  catalogLayout = 'students_situation_ors';
}
