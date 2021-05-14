import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { ViewUserModalComponent } from '../manage-users/view-user-modal/view-user-modal.component';
import { setScrollableContainerHeight } from '../../shared/utils';

@Component({
  selector: 'app-student-catalog',
  templateUrl: './student-catalog.component.html',
  styleUrls: ['./student-catalog.component.scss']
})
export class StudentCatalogComponent implements OnInit, OnDestroy {
  classId: string;
  studentId: string;
  student: {
    id: string,
    full_name: string,
    labels: any[],
    parents: any[],
    risk_description?: string
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
  @ViewChild('appViewUserModal', {static: false}) appViewUserModal: ViewUserModalComponent;


  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private httpClient: HttpClient,
              private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.classId = this.activatedRoute.snapshot.params.classId;
    this.studentId = this.activatedRoute.snapshot.params.studentId;
    this.getCatalogData();
    this.backLink = `/my-classes/${this.classId}/class-detail`;
    setTimeout(() => setScrollableContainerHeight(), 1000);
  }

  private getCatalogData() {
    this.rip = true;
    this.httpClient.get(`own-study-classes/${this.classId}/pupils/${this.studentId}/`).subscribe((response: any) => {
      this.student = {
        full_name: response.full_name,
        id: response.id,
        labels: response.labels,
        risk_description: response?.risk_description,
        parents: response.parents
      };
      this.studyClass = response.study_class;
      this.catalog = this.formatCatalog(response.catalogs_per_subjects);
      this.rip = false;
    }, error => {
      if (error.status === 404) {
        this.router.navigateByUrl('').then();
      }
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
      const teacher = catalog[rowIndex]['teacher'];
      const subjectName = catalog[rowIndex]['subject_name'];

      // Replace the row with the one from response
      catalog[rowIndex] = resp;
      // Add back the teacher and the subject, because they're not included in the response
      catalog[rowIndex]['teacher'] = teacher;
      catalog[rowIndex]['subject_name'] = subjectName;

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

  openUserModal(event, id) {
    this.appViewUserModal.open(id);
  }

  ngOnDestroy(): void {
    document.body.removeAttribute('style');
  }
}
