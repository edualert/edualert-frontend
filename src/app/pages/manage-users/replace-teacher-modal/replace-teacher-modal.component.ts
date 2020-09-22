import {Component, ViewChild} from '@angular/core';
import {ModalComponent} from '../../../shared/modal/modal.component';
import {findIndex} from 'lodash';
import {SubjectToRemove} from '../../../models/subject-to-remove';
import {Teacher} from '../../../models/teacher';

@Component({
  selector: 'app-replace-teacher-modal',
  templateUrl: './replace-teacher-modal.component.html',
  styleUrls: ['./replace-teacher-modal.component.scss']
})
export class ReplaceTeacherModalComponent {
  @ViewChild('modal', {static: false}) modal: ModalComponent;
  title: string;
  description: string;
  cancelButtonText: string = 'Nu';
  confirmButtonText: string = 'Da';
  subjectsToRemove: SubjectToRemove[];

  availableTeachersForSubjects: {};
  newTeachers: {id: number, teacher: number}[] = [];
  selectedTeachers: {} = {};

  open(modalData: ModalData) {
    this.title = modalData.title;
    this.description = modalData.description;
    this.subjectsToRemove = modalData.subjectsToRemove;
    this.availableTeachersForSubjects = modalData.availableTeachersForSubjects;
    this.newTeachers = [];

    this.subjectsToRemove.forEach(subject => {
      this.newTeachers.push({
        id: subject.teacher_class_through['id'],
        teacher: this.availableTeachersForSubjects[subject.name][0].id
      });
      this.selectedTeachers[this.subjectsToRemove.indexOf(subject)] = this.availableTeachersForSubjects[subject.name][0];
    });

    if (modalData.cancelButtonText) {
      this.cancelButtonText = modalData.cancelButtonText;
    }
    if (modalData.confirmButtonText) {
      this.confirmButtonText = modalData.confirmButtonText;
    }
    this.confirmButtonAction = () => {
      modalData.confirmButtonCallback();
      this.modal.close();
    };
    this.modal.open();
  }

  cancel() {
    this.modal.close();
  }

  // Will get its value from the callback passed as param in the open() method
  confirmButtonAction() {
  }

  confirmAddingUser(event, index, subject_name, teacher_class_through_id) {
    if (!this.availableTeachersForSubjects[subject_name]) {
      this.availableTeachersForSubjects[subject_name] = [];
    }

    const newUser = new Teacher(event);
    this.availableTeachersForSubjects[subject_name].push(newUser);
    const newUserIndex = findIndex(this.availableTeachersForSubjects[subject_name], {id: event.id});
    this.handleInputChange({element: newUser, index: newUserIndex}, index, teacher_class_through_id);
  }

  handleInputChange(event, index, teacher_class_through_id) {
    this.newTeachers[findIndex(this.newTeachers, {id: teacher_class_through_id})].teacher = event.element.id;
    this.selectedTeachers[index] = event.element;
  }

}

class ModalData {
  title: string;
  description?: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  subjectsToRemove?: SubjectToRemove[];
  availableTeachersForSubjects?: {};
  confirmButtonCallback: (...param: any) => any; // function
}
