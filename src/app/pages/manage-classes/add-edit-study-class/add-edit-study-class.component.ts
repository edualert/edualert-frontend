import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SchoolDetailsService} from '../../../services/school-details.service';
import {TeachersListService} from '../../../services/teachers-list.service';
import {Teacher} from '../../../models/teacher';
import {CLASS_ALPHA_LETTERS, StudyClass, StudyClassErrors, StudyClassRequestBody} from '../../../models/study-class';
import {StudyClassAvailableGradesList, StudyClassService} from '../../../services/study-class.service';
import {SubjectsListService} from '../../../services/subjects-list.service';
import {IdName} from '../../../models/id-name';
import {IdFullname} from '../../../models/id-fullname';
import {StudentsService} from '../../../services/students.service';
import {AcademicProgramsService} from '../../../services/academic-programs.service';
import {findIndex} from 'lodash';
import {TeacherClassThrough} from '../../../models/teacher-class-through';
import {HttpClient} from '@angular/common/http';
import {getCurrentAcademicYear} from '../../../shared/utils';
import {AddNewUserModalComponent} from '../../manage-users/add-new-user-modal/add-new-user-modal.component';
import {MY_OWN_SCHOOL_CATEGORY_LEVELS_GRADES, SchoolDetail} from '../../../models/school-details';

@Component({
  selector: 'app-add-edit-study-class',
  templateUrl: './add-edit-study-class.component.html',
  styleUrls: ['./add-edit-study-class.component.scss', '../../../shared/label-styles.scss']
})
export class AddEditStudyClassComponent implements OnInit {
  studyClass: StudyClass;
  studyClassErrors: StudyClassErrors;
  schoolData: SchoolDetail;

  availableClasses: string[];
  classesAlphaLetters = CLASS_ALPHA_LETTERS;
  studentList: IdFullname[];
  classMasterCandidates: Teacher[];
  availableSchoolTeachers: Teacher[] = [];
  academicProgramsList: IdName[];

  isEdit: boolean;
  activeTab: string = 'teachers';

  hasUnfilledFields: boolean = false;
  hasUnsavedData: boolean = false;
  hasModifiedData: boolean = false;

  currentAcademicYear = getCurrentAcademicYear();

  tabs = [
    {name: 'Profesorii clasei', id: 'teachers'},
    {name: 'Elevii clasei', id: 'students'}
  ];

  studyClassRequestErrors: string;

  initialStudentNumber: number;

  @ViewChild('addNewUserModal', {'static': false}) addNewUserModal: AddNewUserModalComponent;

  constructor(private activatedRoute: ActivatedRoute,
              private schoolDetailsService: SchoolDetailsService,
              private teachersListService: TeachersListService,
              private studyClassService: StudyClassService,
              private subjectsListService: SubjectsListService,
              private academicProgramsListService: AcademicProgramsService,
              private studentService: StudentsService,
              private studyClassAvaliableGradesList: StudyClassAvailableGradesList,
              private httpClient: HttpClient,
              private router: Router) {
  }

  ngOnInit(): void {
    this.studyClassErrors = new StudyClassErrors();
    this.isEdit = this.activatedRoute.snapshot.params.hasOwnProperty('id');
    if (this.isEdit) {
      this.studyClassService.getData(true, this.activatedRoute.snapshot.params['id']).subscribe(response => {
        this.studyClass = response;
        this.initialStudentNumber = this.studyClass.students.length;
        this.initPageData();
      });
    } else {
      this.studyClass = new StudyClass(null);
      this.studyClass.teachers_class_through = [];
      this.initPageData();
    }
  }

  initPageData() {
    this.schoolDetailsService.getData(true).subscribe(response => {
      this.schoolData = response;
      this.availableClasses = [];
      this.assignAvailableGradesBySchoolType(this.schoolData);
    });
    this.teachersListService.getData(true, 'false').subscribe(response => {
        this.classMasterCandidates = response;
      }
    );
    this.teachersListService.getData(true).subscribe(response => {
        response.forEach(teacher => {
          this.availableSchoolTeachers.push(new Teacher(teacher));
        });
      }
    );
    this.studentService.getData(true).subscribe(response => {
      this.studentList = response;
    });
    if (this.isEdit) {
      this.academicProgramsListService.getData(true, '', this.studyClass.class_grade).subscribe(response => {
        this.academicProgramsList = response;
      });
    }
  }

  handleInputChange(event: { element: any, index: number }, field) {
    if (field === 'academic_program_name') {
      this.studyClass.academic_program = event.element && event.element.id ? event.element.id : null;
      this.studyClass.academic_program_name = event.element && event.element.name ? event.element.name : null;
    } else {
      this.studyClass[field] = event.element;
    }
    if (!this.isEdit && (field === 'class_grade' || field === 'academic_program_name')) {
      this.handlePageDataUpdate();
    }
    this.studyClassErrors[field] = null;
    this.hasUnsavedData = true;
    this.hasModifiedData = true;
  }

  handleListInputChange(event: { element: any, index: number }, field, index) {
    if (field === 'teachers_class_through') {
      this.studyClass.teachers_class_through[index].teacher = event.element;
      this.studyClassErrors.teachers_class_through[index] = {teacher: ''};
    } else {
      if (this.studyClass.students[index].full_name) {
        this.studentList.push(this.studyClass.students[index]);
      }
      this.studyClass.students[index] = event.element;
      if (this.isEdit) {
        this.studyClassErrors.students[index - this.initialStudentNumber].full_name = null;
      } else {
        this.studyClassErrors.students[index].full_name = null;
      }
      this.studentList.splice(findIndex(this.studentList, {id: event.element.id}), 1);
    }
    this.hasUnsavedData = true;
    this.hasModifiedData = true;
  }

  handlePageDataUpdate() {
    this.studyClass.teachers_class_through = [];
    this.studyClassErrors.teachers_class_through = [];
    if (this.studyClass.class_grade) {
      this.academicProgramsListService.getData(true, '', this.studyClass.class_grade).subscribe(response => {
        this.academicProgramsList = response;
      });
      if (this.studyClass.academic_program) {
        this.subjectsListService.getData(true, this.studyClass.academic_program, this.studyClass.class_grade).subscribe(response => {
          response.forEach(classSubject => {
            this.studyClassErrors.teachers_class_through.push({teacher: ''});
            this.studyClass.teachers_class_through.push(new TeacherClassThrough(
              {subject_id: classSubject.subject_id, subject_name: classSubject.subject_name, teacher: new IdFullname({full_name: '-'})}
            ));
          });
        });
      }
    }
  }

  onTabClick(event) {
    this.activeTab = event;
  }

  addStudent() {
    if (this.studyClass.students && this.studyClass.students.length > 0) {
      this.studyClass.students.push(new IdFullname(null));
      this.studyClassErrors.students.push(new IdFullname(null));
    } else {
      this.studyClass.students = [];
      this.studyClassErrors.students = [];
      this.studyClassErrors.students.push(new IdFullname(null));
      this.studyClass.students.push(new IdFullname(null));
    }
  }

  onSubmit() {
    this.hasUnfilledFields = false;
    this.checkObject(this.studyClass, this.studyClassErrors);
    if (!this.hasUnfilledFields) {
      const requestData = this.formatRequestBody(this.studyClass);
      this.makeCreateOrUpdateRequest(requestData);
    } else {
      this.isErrorOnOtherTab();
    }
    this.hasUnfilledFields = false;
  }

  isErrorOnOtherTab() {
    switch (this.activeTab) {
      case 'teachers':
        if (this.studyClassErrors.students?.length > 0) {
          this.studyClassErrors.students.forEach(studentError => {
            if (studentError.full_name) {
              this.studyClassRequestErrors = 'Aveti o eroare in lista de elevi!';
            }
          });
        }
        break;
      case 'students':
        this.studyClassErrors.teachers_class_through.forEach(teacherError => {
          if (teacherError.teacher) {
            this.studyClassRequestErrors = 'Aveti o eroare in lista de profesori!';
          }
        });
        break;
    }
  }

  makeCreateOrUpdateRequest(requestData: StudyClassRequestBody) {
    if (this.isEdit) {
      this.httpClient.put(`study-classes/${this.studyClass.id}/`, requestData).subscribe(response => {
        this.hasModifiedData = false;
        this.hasUnsavedData = false;
        this.router.navigate([`manage-classes/`]);
      }, error => {
        if (error['error']['general_errors']) {
          this.studyClassRequestErrors = error['error']['general_errors'];
        }
      });
    } else {
      this.httpClient.post(`years/${this.currentAcademicYear}/study-classes/`, requestData).subscribe(response => {
        this.hasModifiedData = false;
        this.hasUnsavedData = false;
        this.router.navigate([`manage-classes/`]);
      }, error => {
        if (error['error']['general_errors']) {
          this.studyClassRequestErrors = error['error']['general_errors'][0];
        }
      });
    }
  }

  checkObject(dict: StudyClass, requiredFields) {
    if (!requiredFields) {
      return;
    }
    Object.keys(requiredFields)
      .forEach(key => {
        const data = dict[key];
        if (key === 'teacher' && data && (!data.full_name || data.full_name === '-')) {
          requiredFields[key] = 'Acest câmp este obligatoriu.';
          this.hasUnfilledFields = true;
          return;
        }
        if (requiredFields.hasOwnProperty(key) && data) {
          if (typeof data === 'object' && requiredFields[key]) {
            if (Array.isArray(data)) {
              this.checkArray(data, requiredFields[key]);
            } else {
              this.checkObject(data, requiredFields[key]);
            }
          }
        } else {
          requiredFields[key] = 'Acest câmp este obligatoriu.';
          this.hasUnfilledFields = true;
        }
      });
  }

  checkArray(array, requiredFields) {
    array.forEach((item, index) => {
      this.checkObject(item, requiredFields[index]);
    });
  }

  assignAvailableGradesBySchoolType(schoolDetail: SchoolDetail): void {
    schoolDetail.categories.forEach(category => {
      this.availableClasses = this.availableClasses.concat(MY_OWN_SCHOOL_CATEGORY_LEVELS_GRADES[findIndex(MY_OWN_SCHOOL_CATEGORY_LEVELS_GRADES, {category: category.category_level})].classes);
    });
  }

  formatRequestBody(studyClass: StudyClass): StudyClassRequestBody {

    const requestBody: StudyClassRequestBody = new StudyClassRequestBody();
    requestBody.teachers_class_through = [];
    requestBody.students = [];

    studyClass.teachers_class_through.forEach(subject => {
      requestBody.teachers_class_through.push({
        teacher: subject.teacher.id,
        subject: subject.subject_id
      });
    });
    if (studyClass.students && studyClass.students.length > 0) {
      studyClass.students.forEach(student => {
        requestBody.students.push(parseInt(student.id.toString(), 10));
      });
    }

    requestBody.academic_program = studyClass.academic_program;
    requestBody.class_grade = studyClass.class_grade;
    requestBody.class_letter = studyClass.class_letter;
    requestBody.class_master = studyClass.class_master.id;

    return requestBody;
  }

  deleteStudent(index: number) {
    if (this.isEdit && index <= this.initialStudentNumber) {
      this.initialStudentNumber--;
    }
    if (this.studyClass.students[index].full_name) {
      this.studentList.push(this.studyClass.students[index]);
    }
    this.studyClass.students.splice(index, 1);
  }

  openUserModal() {
    this.addNewUserModal.open();
  }

  @HostListener('window:beforeunload')
  refreshGuard() {
    if (this.hasModifiedData) {
      return false;
    }
    return true;
  }

  getAvailableTeachersForSubject(subjectId: number): Teacher[] {
    const teachersForSubject = [];
    this.availableSchoolTeachers.forEach(teacher => {
      if (teacher.taught_subjects.includes(subjectId)) {
        teachersForSubject.push(teacher);
      }
    });
    return teachersForSubject;
  }

  hideErrorToast() {
    this.studyClassRequestErrors = '';
  }

  cancel() {
    this.hasUnfilledFields = false;
    this.router.navigate([`manage-classes/`]);
  }

}
