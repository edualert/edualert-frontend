import {Component, OnInit, ViewChild} from '@angular/core';
import {AcademicProgramDetails} from '../../../models/academic-program-details';
import {ActivatedRoute, Router} from '@angular/router';
import {get} from 'lodash';
import {HttpClient} from '@angular/common/http';
import {ConfirmationModalComponent} from '../../../shared/confirmation-modal/confirmation-modal.component';
import {AcademicSubject} from '../../../models/academic-subject';
import {findIndex} from 'lodash';

@Component({
  selector: 'app-class-profile-detail',
  templateUrl: './class-profile-detail.component.html',
  styleUrls: ['./class-profile-detail.component.scss', '../../../shared/label-styles.scss']
})
export class ClassProfileDetailComponent implements OnInit {
  academicProgramDetails: AcademicProgramDetails;
  academicProgramId: string;
  subjectsTabsList = [
    {name: 'Materii obligatorii', id: 'mandatory_subjects'},
    {name: 'Materii opționale', id: 'optional_subjects'}
  ];
  coreSubject: AcademicSubject;
  subjectActiveTab: string = this.subjectsTabsList[0].id;
  yearGradesTabList = [];
  yearGradeActiveTab: string;
  requestInProgress: boolean;
  @ViewChild('appConfirmationModal', {static: false}) appConfirmationModal: ConfirmationModalComponent;

  constructor(private activatedRoute: ActivatedRoute,
              private httpClient: HttpClient,
              private router: Router) {
  }

  ngOnInit(): void {
    this.getAcademicProgramDetails();
  }

  private getAcademicProgramDetails() {
    this.requestInProgress = true;
    this.activatedRoute.params.subscribe(params => {
      this.academicProgramId = params?.id;
      this.httpClient.get<AcademicProgramDetails>(`academic-programs/${this.academicProgramId}/`)
        .subscribe((profile: AcademicProgramDetails) => {
          this.academicProgramDetails = new AcademicProgramDetails(profile);
          this.getClassesForAcademicProgram();
          this.requestInProgress = false;
          this.yearGradeActiveTab = this.yearGradesTabList[0]?.id;
          if (this.academicProgramDetails.core_subject) {
            this.getCoreSubject();
          }
        });
    });

  }

  getCoreSubject() {
    Object.keys(this.academicProgramDetails.subjects).forEach(classGrade => {
      const subjectIndex = findIndex(this.academicProgramDetails.subjects[classGrade].mandatory_subjects, {subject_id: this.academicProgramDetails.core_subject});
      if (subjectIndex !== -1) {
        this.coreSubject = this.academicProgramDetails.subjects[classGrade].mandatory_subjects[subjectIndex];
      }
    });
  }

  getClassesForAcademicProgram() {
    Object.keys(this.academicProgramDetails.subjects).forEach(classGrade => {
      this.yearGradesTabList.push({name: `Clasa ${classGrade}`, id: classGrade});
    });
  }

  openDeleteAcademicProgramModal(program: AcademicProgramDetails) {
    const modalData = {
      title: `Doriți să ștergeți profilul ${program.name}?`,
      cancelButtonText: 'NU',
      confirmButtonText: 'DA',
      confirmButtonCallback: () => {
        this.deleteAcademicProgram(program.id);
      }
    };
    this.appConfirmationModal.open(modalData);
  }

  deleteAcademicProgram(programId) {
    this.httpClient.delete(`academic-programs/${programId}/`).subscribe(() => {
      this.router.navigateByUrl('/manage-class-profiles');
    });
  }

  onSubjectTabClicked(tabClicked: string) {
    this.subjectActiveTab = tabClicked;
  }

  onYearGradeTabClicked(tabClicked: string) {
    this.yearGradeActiveTab = tabClicked;
  }

}
