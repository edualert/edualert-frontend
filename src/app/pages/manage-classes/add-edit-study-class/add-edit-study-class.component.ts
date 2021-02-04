import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchoolDetailsService } from '../../../services/school-details.service';
import { TeachersListService } from '../../../services/teachers-list.service';
import { Teacher } from '../../../models/teacher';
import { StudyClass, StudyClassErrors, StudyClassRequestBody } from '../../../models/study-class';
import { StudyClassAvailableGradesList, StudyClassService } from '../../../services/study-class.service';
import { SubjectsListService } from '../../../services/subjects-list.service';
import { IdName } from '../../../models/id-name';
import { IdFullname } from '../../../models/id-fullname';
import { StudentsService } from '../../../services/students.service';
import { AcademicProgramsService } from '../../../services/academic-programs.service';
import { findIndex, cloneDeep } from 'lodash';
import { TeacherClassThrough } from '../../../models/teacher-class-through';
import { HttpClient } from '@angular/common/http';
import { getCurrentAcademicYear } from '../../../shared/utils';
import { MY_OWN_SCHOOL_CATEGORY_LEVELS_GRADES, SchoolDetail } from '../../../models/school-details';
import { UserDetailsBase } from '../../../models/user-details-base';
import { Student } from '../../../models/student';
import { AddUserModalComponent } from '../../manage-users/add-user-modal/add-user-modal.component';
import { CloneClassService } from '../../../services/clone-class.service';
import { AcademicYearCalendarService } from '../../../services/academic-year-calendar.service';
import * as moment from 'moment';


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
  studentList: IdFullname[];
  classMasterCandidates: Teacher[];
  availableSchoolTeachers: Teacher[] = [];
  academicProgramsList: IdName[];
  availableTeachersForSubjects: {} = {};

  requestInProgress: boolean = false;
  academicYearInProgress: boolean = false;
  isEdit: boolean;
  isClone: boolean;
  activeTab: string = 'teachers';

  hasUnfilledFields: boolean = false;
  hasUnsavedData: boolean = false;
  hasModifiedData: boolean = false;

  currentAcademicYear = getCurrentAcademicYear();
  shouldPATCH: boolean = false;

  tabs = [
    {name: 'Profesorii clasei', id: 'teachers'},
    {name: 'Elevii clasei', id: 'students'}
  ];

  studyClassRequestErrors: string;

  initialStudentNumber: number;
  initialStudentIdsArray: number[] = [];
  initialAcademicProgramId: string;

  @ViewChild('addNewUserModal', {'static': false}) addNewUserModal: AddUserModalComponent;

  constructor(private activatedRoute: ActivatedRoute,
              private schoolDetailsService: SchoolDetailsService,
              private teachersListService: TeachersListService,
              private studyClassService: StudyClassService,
              private subjectsListService: SubjectsListService,
              private academicProgramsListService: AcademicProgramsService,
              private studentService: StudentsService,
              private studyClassAvailableGradesList: StudyClassAvailableGradesList,
              private cloneClassService: CloneClassService,
              private academicYearCalendarService: AcademicYearCalendarService,
              private httpClient: HttpClient,
              private router: Router) {
  }

  ngOnInit(): void {
    this.studyClassErrors = new StudyClassErrors();
    this.isEdit = this.activatedRoute.snapshot.params.hasOwnProperty('id');
    this.isClone = this.activatedRoute.snapshot.queryParams.cloned;
    if (this.isClone) {
      this.isEdit = false;
      this.cloneClassService.classToBeCloned.subscribe((studyClass: StudyClass) => {
        this.studyClass = studyClass;
        this.initialStudentNumber = this.studyClass.students.length;
        this.initPageData();
      });
    } else if (this.isEdit) {
      this.academicYearInProgress = true;
      this.academicYearCalendarService.getData(false).subscribe(response => {
        this.shouldPATCH = moment().valueOf() >= moment(response.first_semester.starts_at, 'DD-MM-YYYY').valueOf();
      });
      this.studyClassService.getData(true, this.activatedRoute.snapshot.params['id']).subscribe(response => {
        this.studyClass = response;
        this.studyClass.students.forEach(student => {
          this.initialStudentIdsArray.push(student.id as number);
        });
        this.initialAcademicProgramId = this.studyClass.academic_program;
        this.initialStudentNumber = this.studyClass.students.length;
        this.initPageData();
        this.academicYearInProgress = false;
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
        if (this.isEdit || this.isClone) {
          this.getAndFormatTeachersAndSubjects();
        }
      }
    );
    this.studentService.getData(true).subscribe(response => {
      this.studentList = response;
    });
    if (this.isEdit) {
      this.academicProgramsListService.getData(true, '', this.studyClass.class_grade).subscribe(response => {
        this.academicProgramsList = response.length > 0 ? response : [];
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
    if (field === 'academic_program_name' || field === 'class_grade') {
      this.handlePageDataUpdate();
    }
    this.studyClassErrors[field] = null;
    this.hasUnsavedData = true;
    this.hasModifiedData = true;
  }

  handleListInputChange(event: { element: any, index: number }, field, index) {
    this.studyClassRequestErrors = '';
    if (field === 'teachers_class_through') {
      this.studyClass.teachers_class_through[index].teacher = event.element;
      this.studyClassErrors.teachers_class_through[index] = {teacher: ''};

      if (this.shouldPATCH) {
        if (this.studyClass.updated_teachers === undefined) {
          this.studyClass.updated_teachers = [];
        }
        const teacherToUpdate = {
          id: this.studyClass.teachers_class_through[index].id,
          teacher: event.element.id
        };
        if (findIndex(this.studyClass.updated_teachers, {teacher: teacherToUpdate.teacher}) < 0) {
          const teacherToAddIndex = findIndex(this.studyClass.updated_teachers, {id: teacherToUpdate.id});
          if (teacherToAddIndex < 0) {
            this.studyClass.updated_teachers.push(teacherToUpdate);
          } else {
            this.studyClass.updated_teachers[teacherToAddIndex] = teacherToUpdate;
          }
          this.studyClassErrors.teachers_class_through[index] = {teacher: ''};
        }
      }

    } else {
      if (this.studyClass.students[index].full_name) {
        this.studentList.push(this.studyClass.students[index]);
      }

      this.studyClass.students[index] = event.element;
      if (field === 'students' && this.shouldPATCH) {
        if (this.studyClass.new_students === undefined) {
          this.studyClass.new_students = [];
        }
        this.studyClass.new_students[index - this.initialStudentNumber] = event.element.id;
      }

      if (this.isEdit && this.studyClassErrors.students[index - this.initialStudentNumber]) {
        this.studyClassErrors.students[index - this.initialStudentNumber].full_name = null;
      } else if (this.studyClassErrors.students[index]) {
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
        this.requestInProgress = true;
        this.getAndFormatTeachersAndSubjects();
      }
    }
  }

  onTabClick(event) {
    this.activeTab = event;
  }

  addStudent() {
    if (!this.studyClass.new_students) {
      this.studyClass.new_students = [];
    }
    if (this.studyClass.students && this.studyClass.students.length > 0) {
      this.studyClass.students.push(new IdFullname(null));
      if (!this.studyClassErrors.students) {
        this.studyClassErrors.students = [];
      }
      this.studyClassErrors.students.push(new IdFullname(null));
    } else {
      this.studyClass.students = [];
      this.studyClassErrors.students = [];
      this.studyClassErrors.students.push(new IdFullname(null));
      this.studyClass.students.push(new IdFullname(null));
    }
  }

  onSubmit() {
    if (!this.studyClass.updated_teachers?.length && !this.studyClass.teachers_class_through?.length) {
      return;
    }

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
              this.studyClassRequestErrors = 'Aveți o eroare în lista de elevi!';
            }
          });
        }
        break;
      case 'students':
        this.studyClassErrors.teachers_class_through.forEach(teacherError => {
          if (teacherError.teacher) {
            this.studyClassRequestErrors = 'Aveți o eroare în lista de profesori!';
          }
        });
        break;
    }
  }

  makeCreateOrUpdateRequest(requestData: StudyClassRequestBody) {
    if (this.isEdit) {
      if (this.shouldPATCH) {
        this.httpClient.patch(`study-classes/${this.studyClass.id}/`, requestData).subscribe(response => {
          this.hasModifiedData = false;
          this.hasUnsavedData = false;
          this.router.navigate([`manage-classes/`]);
        }, error => {
          if (error['error']['general_errors']) {
            this.studyClassRequestErrors = error['error']['general_errors'];
          }
        });
      } else {
        this.httpClient.put(`study-classes/${this.studyClass.id}/`, requestData).subscribe(response => {
          this.hasModifiedData = false;
          this.hasUnsavedData = false;
          this.router.navigate([`manage-classes/`]);
        }, error => {
          if (error['error']['general_errors']) {
            this.studyClassRequestErrors = error['error']['general_errors'];
          }
        });
      }
    } else {
      this.httpClient.post(`years/${this.currentAcademicYear}/study-classes/`, requestData).subscribe(response => {
        this.hasModifiedData = false;
        this.hasUnsavedData = false;
        this.router.navigate([`manage-classes/`]);
      }, error => {
        if (error['error']['general_errors']) {
          this.studyClassRequestErrors = error['error']['general_errors'];
        }
        if (error.error['class_master']) {
          this.studyClassRequestErrors = `Diriginte: ${error.error['class_master']}`;
          this.studyClassErrors.class_master = error.error['class_master'];
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
        if (key === 'teachers_class_through' && data && data.length > 0) {
          data.forEach(teacherClassThrough => {
            const teacherClassThroughIndex = data.indexOf(teacherClassThrough);
            if ([undefined, '', '-'].includes(teacherClassThrough.teacher.full_name)) {
              if (!requiredFields[key][teacherClassThroughIndex]) {
                requiredFields[key][teacherClassThroughIndex] = {};
              }
              requiredFields[key][data.indexOf(teacherClassThrough)].teacher = 'Acest câmp este obligatoriu.';
              this.hasUnfilledFields = true;
            }
          });
          return;
        }
        if (key === 'students' && data && data.length > 0) {
          data.forEach(student => {
            if ([undefined, ''].includes(student?.full_name)) {
              if (!requiredFields[key][data.indexOf(student)]) {
                requiredFields[key][data.indexOf(student)] = {};
              }
              requiredFields[key][data.indexOf(student)].full_name = 'Acest câmp este obligatoriu.';
              this.hasUnfilledFields = true;
              return;
            }
          });
        }
        if (requiredFields.hasOwnProperty(key) && data) {
          if (typeof data === 'object' && requiredFields[key]) {
            if (Array.isArray(data)) {
              this.checkArray(data, requiredFields[key]);
            } else {
              this.checkObject(data, requiredFields[key]);
            }
          }
        } else if (key !== 'students') {
          requiredFields[key] = 'Acest câmp este obligatoriu.';
          this.hasUnfilledFields = true;
        }
        if (requiredFields.hasOwnProperty(key) && data && key === 'class_letter' && !/^[A-Z0-9]*$/.test(data)) {
          this.hasUnfilledFields = true;
          requiredFields[key] = 'Acest câmp poate conține doar litere mari și cifre.';
          return;
        }
      });
  }

  checkArray(array, requiredFields) {
    array.forEach((item, index) => {
      Object.keys(item).forEach(key => {
        if (item[key] !== undefined) {
          this.checkObject(item, requiredFields[index]);
        }
      });
    });
  }

  assignAvailableGradesBySchoolType(schoolDetail: SchoolDetail): void {
    schoolDetail.categories.forEach(category => {
      this.availableClasses = this.availableClasses.concat(MY_OWN_SCHOOL_CATEGORY_LEVELS_GRADES[findIndex(MY_OWN_SCHOOL_CATEGORY_LEVELS_GRADES, {category: category.category_level})].classes);
    });
  }

  formatRequestBody(studyClass: StudyClass): StudyClassRequestBody {
    const requestBody: StudyClassRequestBody = new StudyClassRequestBody();

    if (this.shouldPATCH) {
      requestBody.class_master = studyClass.class_master.id;
      requestBody.updated_teachers = [];
      studyClass.updated_teachers?.forEach(teacher => {
        requestBody.updated_teachers.push({
          id: teacher.id,
          teacher: teacher.teacher
        });
      });
      requestBody.new_students = studyClass.new_students;
      requestBody.deleted_students = studyClass.deleted_students;

      // Check if the deleted users are in requestBody.new_students
      requestBody.new_students?.forEach(studentId => {
        if (requestBody.deleted_students?.includes(studentId)) {
          requestBody.new_students.splice(requestBody.new_students.indexOf(studentId), 1);
          requestBody.deleted_students.splice(requestBody.deleted_students.indexOf(studentId), 1);
        }
      });
      requestBody.deleted_students?.forEach(studentId => {
        if (requestBody.new_students?.includes(studentId)) {
          requestBody.new_students.splice(requestBody.new_students.indexOf(studentId), 1);
          requestBody.deleted_students.splice(requestBody.deleted_students.indexOf(studentId), 1);
        }
      });
    } else {
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

    }
    return requestBody;
  }

  deleteStudent(index: number) {
    if (this.isEdit && index <= this.initialStudentNumber) {
      if (this.shouldPATCH && !this.studyClass.new_students && this.studyClass.new_students?.length === 0) {
        this.initialStudentNumber--;
      } else if (!this.shouldPATCH || index < this.initialStudentNumber) {
        this.initialStudentNumber--;
      }
    }
    if (this.studyClass.students[index].full_name) {
      this.studentList.push(this.studyClass.students[index]);
    }
    if (this.shouldPATCH) {
      if (this.studyClass.deleted_students === undefined) {
        this.studyClass.deleted_students = [];
      }
      const studentId = this.studyClass.students[index].id as number;
      if (this.initialStudentIdsArray.includes(studentId) && !this.studyClass.deleted_students.includes(studentId)) {
        this.studyClass.deleted_students.push(studentId);
      }
      if (this.studyClass.new_students && this.studyClass.new_students.includes(studentId)) {
        if (studentId === undefined) {
          const oldStudentsCount = this.studyClass.students.length - this.studyClass.new_students.length;
          const newStudentsIndex = index - oldStudentsCount;
          this.studyClass.new_students.splice(newStudentsIndex, 1);
        } else {
          this.studyClass.new_students.splice(this.studyClass.new_students.indexOf(studentId), 1);
        }
        this.studyClass.students.splice(index, 1);
      } else {
        this.studyClass.students.splice(index, 1);
      }
    } else {
      this.studyClass.students.splice(index, 1);
    }

    if (this.studyClassErrors.students.indexOf(this.studyClass.students[index])) {
      this.studyClassErrors.students.splice(this.studyClassErrors.students.indexOf(this.studyClass.students[index]), 1);
    }
  }

  openUserModal(userRole: 'ORS' | 'SCHOOL_PRINCIPAL' | 'TEACHER' | 'PARENT' | 'STUDENT') {
    this.addNewUserModal.open({user_role: userRole, confirmButtonCallback: null});
  }

  @HostListener('window:beforeunload')
  refreshGuard() {
    if (this.hasModifiedData) {
      return false;
    }
    return true;
  }

  getAvailableTeachersForSubject() {
    this.studyClass.teachers_class_through.forEach((subject: TeacherClassThrough) => {
      if (subject.is_mandatory) {
        this.availableSchoolTeachers.forEach(teacher => {
          if (teacher.taught_subjects.includes(subject.subject_id)) {
            this.availableTeachersForSubjects[subject.subject_name] = this.availableTeachersForSubjects[subject.subject_name] || [];
            this.availableTeachersForSubjects[subject.subject_name].push(teacher);
          }
        });
      } else if (subject.is_mandatory === false) {
        this.availableTeachersForSubjects[subject.subject_name] = cloneDeep(this.availableSchoolTeachers);
      }
    });
  }

  getAndFormatTeachersAndSubjects() {
    this.subjectsListService.getData(true, this.studyClass.academic_program, this.studyClass.class_grade).subscribe(response => {
      response.forEach(classSubject => {
        const subjectIndex = findIndex(this.studyClass.teachers_class_through, {subject_id: classSubject.subject_id});
        if (subjectIndex > -1 && this.initialAcademicProgramId === this.studyClass.academic_program) {
          this.studyClass.teachers_class_through[subjectIndex] = {
            id: this.studyClass.teachers_class_through[subjectIndex].id,
            subject_id: classSubject.subject_id,
            subject_name: classSubject.subject_name,
            teacher: this.studyClass.teachers_class_through[subjectIndex].teacher,
            is_mandatory: classSubject.is_mandatory,
          };
        } else {
          this.studyClass.teachers_class_through.push(new TeacherClassThrough({
              subject_id: classSubject.subject_id,
              subject_name: classSubject.subject_name,
              teacher: new IdFullname({full_name: '-'}),
              is_mandatory: classSubject.is_mandatory,
            }
          ));
        }
      });
      this.getAvailableTeachersForSubject();
      this.initialAcademicProgramId = this.studyClass.academic_program;
      this.requestInProgress = false;
    });
  }

  hideErrorToast() {
    this.studyClassRequestErrors = '';
  }

  cancel() {
    this.hasUnfilledFields = false;
    this.router.navigate([`manage-classes/`]);
  }

  confirmAddingUser(response: UserDetailsBase, isClassMasterCandidate?: boolean, index?: number, subject_name?: string) {
    if (!this.availableTeachersForSubjects[subject_name]) {
      this.availableTeachersForSubjects[subject_name] = [];
    }
    let newUser;
    if (isClassMasterCandidate) {
      newUser = new Teacher(response);
      this.classMasterCandidates.push(newUser);
      const newUserIndex = findIndex(this.classMasterCandidates, {id: response.id});
      this.handleInputChange({element: newUser, index: newUserIndex}, 'class_master');
    } else if (response.user_role === 'TEACHER' && !isClassMasterCandidate) {
      newUser = new Teacher(response);
      this.availableTeachersForSubjects[subject_name].push(newUser);
      const newUserIndex = findIndex(this.availableTeachersForSubjects[subject_name], {id: response.id});
      this.handleListInputChange({element: newUser, index: newUserIndex}, 'teachers_class_through', index);
    } else if (response.user_role === 'STUDENT') {
      newUser = new Student(response);
      this.studentList.push(newUser);
      const newUserIndex = findIndex(this.studentList, {id: response.id});
      this.handleListInputChange({element: newUser, index: newUserIndex}, 'students', index);
    }
  }

}
