import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {cloneDeep} from 'lodash';
import {HttpClient} from '@angular/common/http';
import {YearGrades} from '../../../models/year-grades';
import {AcademicProgramDetails} from '../../../models/academic-program-details';
import {IdName} from '../../../models/id-name';
import {AcademicYearGrade} from '../../../models/academic-year-grade';
import {AcademicSubject} from '../../../models/academic-subject';
import {IdText} from '../../../models/id-text';
import {getCurrentAcademicYear} from '../../../shared/utils';
import {SchoolDetailsService} from '../../../services/school-details.service';
import {findIndex} from 'lodash';
import {AcademicYearCalendarService} from '../../../services/academic-year-calendar.service';

class SubjectError {
  subject_name?: string;
  weekly_hours_count?: string;

  constructor(obj?: any) {
    this.subject_name = obj?.subject_name;
    this.weekly_hours_count = obj?.weekly_hours_count;
  }
}

class UpdatableSubject {
  class_grade: YearGrades;
  subject: string;
  weekly_hours_count: number;

  constructor(obj?: any) {
    this.class_grade = obj?.class_grade;
    this.subject = obj?.subject || obj?.subject_name;
    this.weekly_hours_count = obj?.weekly_hours_count;
  }
}

class UpdatableProgram {
  optional_subjects: UpdatableSubject[];

  constructor(details: AcademicProgramDetails) {
    this.optional_subjects = (Object.keys(details.subjects).map((key: YearGrades) => {
      return details.subjects[key].optional_subjects.map((subject: AcademicSubject) => {
        return new UpdatableSubject({...subject, class_grade: key});
      });
    }) as any).flat();
  }
}

class CreatableSubject {
  class_grade: YearGrades;
  subject: string;
  weekly_hours_count: number;

  constructor(obj?: any) {
    this.class_grade = obj?.class_grade;
    this.subject = obj?.subject || obj?.subject_name;
    this.weekly_hours_count = obj?.weekly_hours_count;
  }
}

class CreatableProgram {
  generic_academic_program: number; // the unregistered academic program ID
  optional_subjects: CreatableSubject[];
  core_subject: number;

  constructor(details: AcademicProgramDetails) {
    this.core_subject = details?.core_subject?.subject_id;
    this.generic_academic_program = details.id;
    this.optional_subjects = (Object.keys(details.subjects).map((key: YearGrades) => {
      return details.subjects[key].optional_subjects.map((subject: AcademicSubject) => {
        return new CreatableSubject({...subject, class_grade: key});
      });
    }) as any).flat();
  }
}


@Component({
  selector: 'app-class-profile-add-edit',
  templateUrl: './class-profile-add-edit.component.html',
  styleUrls: ['./class-profile-add-edit.component.scss', '../../../shared/label-styles.scss']
})
export class ClassProfileAddEditComponent implements OnInit {
  page: 'add' | 'edit';
  academicProgram: AcademicProgramDetails = new AcademicProgramDetails();
  yearGradesTabList: IdName[] = [];
  yearGradeActiveTab = 'IX';
  subjectsTabsList: IdName[] = [
    {name: 'Materii obligatorii', id: 'mandatory_subjects'},
    {name: 'Materii opționale', id: 'optional_subjects'}
  ];
  subjectActiveTab = 'mandatory_subjects';
  unregisteredAcademicPrograms: { id: number, name: string, subjects: any, optional_subjects_weekly_hours: any }[];
  readonly defaultAcademicYear: IdText = new IdText({id: getCurrentAcademicYear(), text: `${getCurrentAcademicYear()} - ${getCurrentAcademicYear() + 1}`});
  selectedOptionalSubject: number;

  coreSubject: AcademicSubject;
  hasCoreSubject: boolean = false;
  coreSubjectsList: AcademicSubject[];
  currentAcademicYear: any;

  errors: any;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private httpClient: HttpClient,
              private ownSchoolUnit: SchoolDetailsService,
              private academicYearCalendarService: AcademicYearCalendarService) {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (val.url.includes('add')) {
          this.initialiseAdd();
        } else {
          this.initialiseEdit();
        }
      }
    });
  }

  ngOnInit(): void {
    this.ownSchoolUnit.getData(true).subscribe(school => {
      this.hasCoreSubject = ['Artistic', 'Sportiv'].includes(school.academic_profile.name);
      this.coreSubjectsList = [];
    });
  }

  private initialiseAdd(): void {
    this.page = 'add';
    this.getUnregisteredAcademicPrograms();
    this.getCurrentAcademicYear();
  }

  private initialiseEdit(): void {
    this.page = 'edit';
    const id = this.activatedRoute.snapshot.params.id;

    this.httpClient.get(`academic-programs/${id}/`).subscribe((resp: any) => {
      this.academicProgram = new AcademicProgramDetails(resp);
      this.initialiseTabs(resp.subjects);
      this.initialiseErrors();
      this.getCoreSubject();
      this.listAllMandatorySubjects(this.academicProgram);
    });
  }

  private initialiseTabs(subjects: { [yearGrade: string]: AcademicYearGrade }): void {
    this.yearGradesTabList = Object.keys(subjects).map((yearGrade: string) => ({id: yearGrade, name: YearGrades[yearGrade]}));
  }

  private getCoreSubject() {
    Object.keys(this.academicProgram.subjects).forEach(classGrade => {
      const subjectIndex = findIndex(this.academicProgram.subjects[classGrade].mandatory_subjects, {subject_id: this.academicProgram.core_subject});
      if (subjectIndex !== -1) {
        this.coreSubject = this.academicProgram.subjects[classGrade].mandatory_subjects[subjectIndex];
      }
    });
  }

  private getCurrentAcademicYear() {
    this.academicYearCalendarService.getData(true)
      .subscribe( response => {
        this.currentAcademicYear = response;
      });
  }

  // USED ONLY IN ADD
  private getUnregisteredAcademicPrograms(): void {
    this.httpClient.get('unregistered-academic-programs/').subscribe((resp: any) => {
      this.unregisteredAcademicPrograms = resp.map((item => new IdName(item)));
    });
  }

  selectCoreSubject(subject: any) {
    this.coreSubject = subject;
    this.academicProgram.core_subject = subject;
  }

  selectAcademicProgram(id: number | string): void {
    const unregisteredIndex = this.unregisteredAcademicPrograms.findIndex((elem: IdName) => elem.id === id);

    // If already has subjects, it means we've already requested backend for this program: Skip the request
    if (this.unregisteredAcademicPrograms[unregisteredIndex].hasOwnProperty('subjects')) {
      this.setNewProgram(this.unregisteredAcademicPrograms[unregisteredIndex]);
      if (this.hasCoreSubject) {
        this.listAllMandatorySubjects(this.academicProgram);
      }
    } else {
      this.httpClient.get(`generic-academic-programs/${id}/`).subscribe((resp: { id, subjects, optional_subjects_weekly_hours }) => {
        // populate the unregisteredProgram with the subjects from backend
        this.unregisteredAcademicPrograms[unregisteredIndex].subjects = this.convertToAcademicYearGrade(resp.subjects);
        this.unregisteredAcademicPrograms[unregisteredIndex].optional_subjects_weekly_hours = resp.optional_subjects_weekly_hours;
        this.setNewProgram(this.unregisteredAcademicPrograms[unregisteredIndex]);
        if (this.hasCoreSubject) {
          this.listAllMandatorySubjects(this.academicProgram);
        }
      });
    }
  }

  weeklyHoursSum(yearGrade: string, selectedProgram: number) {
    const optionalSubjects = this.academicProgram?.subjects[yearGrade].optional_subjects;

    if (optionalSubjects.length === 0) {
      return null;
    }
    if (optionalSubjects.length === 1) {
      return optionalSubjects[0].weekly_hours_count;
    }
    return optionalSubjects[selectedProgram].weekly_hours_count;
  }

  private convertToAcademicYearGrade(subjects: { [yearGrade: string]: AcademicSubject[] }): { [yearGrade: string]: AcademicYearGrade } {
    const newObject: { [yearGrade: string]: AcademicYearGrade } = {};
    Object.keys(subjects).forEach((year: string) => {
      newObject[year] = new AcademicYearGrade({mandatory_subjects: subjects[year]});
    });
    return newObject;
  }

  private setNewProgram(program: { id: number, name?: string, subjects: any, optional_subjects_weekly_hours: any }) {
    this.academicProgram = new AcademicProgramDetails(program);
    this.initialiseTabs(program.subjects);
    this.initialiseErrors();
  }

  // END USED ONLY IN ADD

  private initialiseErrors(): void {
    this.errors = cloneDeep(this.academicProgram.subjects);
    Object.keys(this.errors).forEach((key: string) => {
      delete this.errors[key].mandatory_subjects;
      this.errors[key].optional_subjects = this.errors[key].optional_subjects.map(() => new SubjectError());
    });
    if (this.hasCoreSubject) {
      this.errors.core_subject = null;
    }
  }

  onSubjectTabClicked(tabClicked: string) {
    this.subjectActiveTab = tabClicked;
  }

  onYearGradeTabClicked(tabClicked: string) {
    this.yearGradeActiveTab = tabClicked;
  }

  subjectNameChange(index: number, value: string): void {
    this.academicProgram.subjects[this.yearGradeActiveTab].optional_subjects[index].subject_name = value;
    this.errors[this.yearGradeActiveTab].optional_subjects[index].subject_name = '';
  }

  weeklyHoursChange(index: number, value: string): void {
    this.selectedOptionalSubject = index;
    this.academicProgram.subjects[this.yearGradeActiveTab].optional_subjects[index].weekly_hours_count = parseInt(value || '0', 10);
    this.errors[this.yearGradeActiveTab].optional_subjects[index].weekly_hours_count = '';
  }

  deleteSubject(index: number): void {
    this.academicProgram.subjects[this.yearGradeActiveTab].optional_subjects.splice(index, 1);
    this.errors[this.yearGradeActiveTab].optional_subjects.splice(index, 1);
  }

  addSubject(): void {
    this.academicProgram.subjects[this.yearGradeActiveTab].optional_subjects.push(new AcademicSubject({subject_name: null, weekly_hours_count: null, subject_id: null, id: null}));
    this.errors[this.yearGradeActiveTab].optional_subjects.push({});
  }


  submit(): void {
    if (this.page === 'add') {
      this.create();
    } else {
      this.update();
    }
  }

  private listAllMandatorySubjects(academicProgram: AcademicProgramDetails) {
    Object.keys(academicProgram.subjects).forEach(grade => {
      academicProgram.subjects[grade].mandatory_subjects.forEach(subject => {
        if (findIndex(this.coreSubjectsList, {subject_id: subject.subject_id}) !== -1) {
          return;
        } else {
          this.coreSubjectsList.push(subject);
        }
      });
    });
  }

  private checkErrors(): boolean {
    let hasErrors = false;
    if (this.hasCoreSubject && !this.academicProgram.core_subject) {
      this.errors.core_subject = 'Acest câmp este obligatoriu';
      hasErrors = true;
    }
    Object.keys(this.academicProgram.subjects).forEach((key: string) => {
      const grade = this.academicProgram.subjects[key];
      grade.optional_subjects.forEach((item, index) => {
        const error = this.errors[key].optional_subjects[index];
        if (!item.subject_name) {
          error.subject_name = 'Acest câmp este obligatoriu';
          hasErrors = true;
        } else {
          error.subject_name = null;
        }

        if (!item.weekly_hours_count) {
          error.weekly_hours_count = 'Acest câmp este obligatoriu';
          hasErrors = true;
        } else {
          error.weekly_hours_count = null;
        }
      });
    });
    return hasErrors;
  }

  private create(): void {
    if (this.checkErrors()) {
      return;
    }

    const creatableObject = new CreatableProgram(this.academicProgram);
    this.httpClient.post(`years/${this.defaultAcademicYear.id}/academic-programs/`, creatableObject).subscribe((resp: AcademicProgramDetails) => {
      this.router.navigate([`manage-class-profiles/${resp.id}/view`]);
    });
  }

  private update(): void {
    if (this.checkErrors()) {
      return;
    }
    //TODO: Complete the update() once the backend team finds the courage and spirit to implement the PATCH properly
    const updatableObject = new UpdatableProgram(this.academicProgram);
    this.httpClient.patch(`academic-programs/${this.academicProgram.id}/`, updatableObject).subscribe((resp) => {
      this.router.navigateByUrl(`manage-class-profiles/${this.academicProgram.id}/view`);
    });
  }


  cancel(): void {
    if (this.page === 'add') {
      this.router.navigateByUrl('/manage-class-profiles');
    } else {
      this.router.navigateByUrl(`/manage-class-profiles/${this.academicProgram.id}/view`);
    }
  }

}
