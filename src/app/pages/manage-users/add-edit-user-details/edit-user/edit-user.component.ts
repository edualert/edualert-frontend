import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {UserDetails} from '../../../../models/user-details';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {get} from 'lodash';
import {AccountService} from '../../../../services/account.service';
import {findIndex} from 'lodash';
import {ReplaceTeacherModalComponent} from '../../replace-teacher-modal/replace-teacher-modal.component';
import {TeachersListService} from '../../../../services/teachers-list.service';
import {Teacher} from '../../../../models/teacher';
import {SubjectToRemove} from '../../../../models/subject-to-remove';


@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {

  account: UserDetails;
  userDetails: UserDetails;
  errors: any = {};
  userDetailsId: string;
  availableFields: any;
  hasModifiedData: boolean = false;
  hasUnfilledFields: boolean = false;
  hasUnsavedData: boolean = true;
  subjectsToRemove: SubjectToRemove[] = [];
  teachersList: Teacher[];
  removedSubjects: number[] = [];
  hasEditedSubjects: boolean = false;

  private readonly path = 'users/';

  @ViewChild('saveButton') saveButton: ElementRef;
  @ViewChild('replaceTeacherModal', {static: false}) replaceTeacherModal: ReplaceTeacherModalComponent;

  constructor(
    accountService: AccountService,
    private teachersListService: TeachersListService,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
  ) {
    accountService.account.subscribe((account: UserDetails) => {
      this.account = account;
    });
  }

  @HostListener('window:beforeunload')
  refreshGuard($event) {
    if (this.hasModifiedData) {
      $event.returnValue = '';
    }
  }

  hasModifiedDataEvent(hasModifiedData) {
    this.hasModifiedData = hasModifiedData
  }

  hasModifiedSubjects(subjectsHaveBeenModified) {
    this.hasEditedSubjects = subjectsHaveBeenModified;
  }

  submitData(userDetails) {
    if (userDetails !== null) {
      if (this.hasEditedSubjects) {
        if (this.hasAssignedStudyClassesForRemovedTaughtSubjects(userDetails)) {
          this.teachersListService.getData(true, 'false').subscribe(response => {
            this.teachersList = response;
            this.openReplaceAssignedTeacherModal(userDetails);
          });
          return;
        }
      }
      for (const key of Object.keys(userDetails)) {
        if (userDetails[key] === '') {
          userDetails[key] = null;
        }
      }
      let requestBody = {...userDetails};
      requestBody.labels = requestBody.labels ? requestBody.labels.map(el => el.id) : requestBody.labels;
      requestBody.parents = requestBody.parents ? requestBody.parents.map(el => el.id) : requestBody.parents;
      requestBody.taught_subjects = requestBody.taught_subjects ? requestBody.taught_subjects.map(el => el.id) : requestBody.taught_subjects;
      Object.keys(requestBody).forEach((elem) => {
        if (requestBody[elem] === '') {
          requestBody[elem] = null;
        }
      });
      this.httpClient.put('users/' + this.userDetails.id + '/', requestBody).subscribe((response) => {
        this.hasUnsavedData = false;
        this.router.navigate(['manage-users']);
      }, (error) => {
        this.errors = error['error'];
      });
    }
  }

  getAvailableTeachersForSubjects(teachersList: Teacher[], subjects: {}[]) {
    const availableTeachersForSubjects: {} = {};
    subjects.forEach(subject => {
      teachersList.forEach(teacher => {
        if (teacher.taught_subjects.includes(Number(subject['id']))) {
          if (!availableTeachersForSubjects[subject['name']]) availableTeachersForSubjects[subject['name']] = [];
          availableTeachersForSubjects[subject['name']].push(teacher);
        }
      });
    });
    return availableTeachersForSubjects;
  }

  openReplaceAssignedTeacherModal(user) {
    const subjectsNamesToRemove: string[] = [...new Set(this.subjectsToRemove.map(subject => subject['name']))];
    const modalData = {
      title: `Doriți să scoateți ${subjectsNamesToRemove.length > 1 ? 'materiile' : 'materia'} ${subjectsNamesToRemove.join(', ')} din lista de materii predate de profesorul ${user.full_name}?`,
      description: `Pentru a putea finaliza această acțiune, alți utilizatori trebuie să fie aleși ca profesori la aceleași materii pentru aceste clase.`,
      subjectsToRemove: this.subjectsToRemove,
      availableTeachersForSubjects: this.getAvailableTeachersForSubjects(this.teachersList, this.subjectsToRemove),
      cancelButtonText: 'NU',
      confirmButtonText: 'DA',
      confirmButtonCallback: () => {
        if (this.replaceTeacherModal.newTeachers) {
          this.userDetails['new_teachers'] = this.replaceTeacherModal.newTeachers;
          this.removedSubjects = this.subjectsToRemove.map(subject => Number(subject.id));
          this.submitData(this.userDetails);
        }
      }
    };
    this.replaceTeacherModal.open(modalData);
  }

  hasAssignedStudyClassesForRemovedTaughtSubjects(userDetails) {
    const assignedClassesSubjectsIds: number[] = [];
    const taughtSubjectsIds: number[] = [];
    let hasAssignedClasses: boolean = false;

    this.subjectsToRemove = [];
    userDetails.assigned_study_classes?.forEach(studyClass => {
      if (!assignedClassesSubjectsIds.includes(studyClass.subject_id)) assignedClassesSubjectsIds.push(studyClass.subject_id);
    });
    userDetails.taught_subjects?.forEach(subject => taughtSubjectsIds.push(subject.id));
    assignedClassesSubjectsIds.forEach(assignedSubjectId => {
      if (!taughtSubjectsIds.includes(assignedSubjectId) && !this.removedSubjects.includes(assignedSubjectId)) {
        if (!this.subjectsToRemove.map(subject => subject['id']).includes(assignedSubjectId)) {
          const indexes = userDetails.assigned_study_classes.map((elm, index) => elm.subject_id === assignedSubjectId ? index : '').filter(String);
          indexes.forEach(index => {
            this.subjectsToRemove.push({
              id: userDetails.assigned_study_classes[index].subject_id,
              name: userDetails.assigned_study_classes[index].subject_name,
              teacher_class_through: userDetails.assigned_study_classes[index]
            });
          });
        }
        hasAssignedClasses = true;
        return hasAssignedClasses;
      }
    });
    return hasAssignedClasses;
  }

  getUserDetails() {
    this.activatedRoute.params.subscribe(params => {
      this.userDetailsId = get(params, 'userId', null);
      this.httpClient.get<UserDetails>(this.path + this.userDetailsId + '/').subscribe(response => {
        this.userDetails = response;
      });
    });
  }

  ngOnInit(): void {
    this.getUserDetails();
  }

}
