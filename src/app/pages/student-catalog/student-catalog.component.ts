import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {cloneDeep} from 'lodash';
import {Observable} from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-student-catalog',
  templateUrl: './student-catalog.component.html',
  styleUrls: ['./student-catalog.component.scss']
})
export class StudentCatalogComponent implements OnInit {
  classId: string;
  studentId: string;
  student: {
    id: string,
    full_name: string,
    labels: any[],
    parents: any[]
  };
  studyClass: {
    id: number,
    class_grade: string,
    class_letter: string
  };
  catalog: any[];
  backLink: string;
  layout = 'student_catalog';
  rip: boolean;


  constructor(private activatedRoute: ActivatedRoute, private httpClient: HttpClient) {
  }

  ngOnInit(): void {
    this.classId = this.activatedRoute.snapshot.params.classId;
    this.studentId = this.activatedRoute.snapshot.params.studentId;
    this.getCatalogData();
    this.backLink = `/my-classes/${this.classId}/class-detail`;
  }

  private getCatalogData() {
    this.rip = true;
    this.httpClient.get(`own-study-classes/${this.classId}/pupils/${this.studentId}/`).subscribe((response: any) => {
      this.student = {
        full_name: response.full_name,
        id: response.id,
        labels: response.labels,
        parents: response.parents
      };
      this.studyClass = response.study_class;
      this.catalog = this.formatCatalog(response.catalogs_per_subjects);
      this.rip = false;
    });
  }

  private formatCatalog(catalog) {
    return catalog.map((subject) => {
      const subj = cloneDeep(subject);

      subj.subject = {
        teacher: subject.teacher,
        subject_name: subject.subject_name
      };

      return subj;
    });
  }

  private modifyCatalog(request: Observable<any>): void {

    // Remember the tab and its associated data before the request.

    request.subscribe((resp: any) => {
      const rowIndex = this.catalog.findIndex(row => row.id === resp.id);
      const catalog = cloneDeep(this.catalog);
      catalog[rowIndex] = resp;
      this.catalog = this.formatCatalog(catalog);
    });
  }

  addSingleAbsence(value: { absence: { date: Date, isFounded: boolean }, id: number, semester: string }): void {
    const request = this.httpClient.post(
      `catalogs/${value.id}/absences/`,
      {
        taken_at: moment(value.absence.date).format('DD-MM-YYYY'),
        isFounded: value.absence.isFounded
      }
    );
    this.modifyCatalog(request);
  }
  deleteAbsence(absence: any): void {
    const request = this.httpClient.delete(`absences/${absence.id}/`);
    this.modifyCatalog(request);
  }

  authorizeAbsence(absence: any): void {
    const request = this.httpClient.post(`absences/${absence.id}/authorize/`, {});
    this.modifyCatalog(request);
  }
}
