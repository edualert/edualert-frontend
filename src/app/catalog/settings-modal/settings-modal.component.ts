import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ModalComponent} from '../../shared/modal/modal.component';
import {HttpClient} from '@angular/common/http';
import {ClassDetails} from '../../models/class-details';
import {StudentSettings} from '../../models/student-settings';
import {findIndex} from 'lodash';

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.scss']
})
export class SettingsModalComponent {
  classId: number;
  subjectId: string | number;
  classGrade: string;
  classLetter: string;
  classSettings: StudentSettings[] = [];
  updateSettingsBody: StudentSettings[] = [];
  allowsExemption: boolean;
  isOptional: boolean;
  isGloballySelected: {[key: string]: boolean};

  @ViewChild('modal', {static: false}) modal: ModalComponent;
  @Output() refreshCatalogData: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private http: HttpClient) {
  }

  fetchSettingsData() {
    this.http.get(`own-study-classes/${this.classId}/subjects/${this.subjectId}/settings/`).subscribe((response: StudentSettings[]) => {
      this.classSettings = response;
      this.isGloballySelected = {};
      Object.keys(this.classSettings[0]).forEach(key => {
        if (key !== "id" && key !== "student") {
          this.isGloballySelected[key] = false;
        }
      });
    }, (error) => {});
  }

  updateSettings() {
    this.http.put(`own-study-classes/${this.classId}/subjects/${this.subjectId}/settings/`, this.updateSettingsBody).subscribe((response: StudentSettings[]) => {
      this.classSettings = response;
      this.refreshCatalogData.emit();
    }, (error) => {});
  }

  save() {
    this.updateSettings();
    this.close();
  }

  close() {
    this.modal.close();
    this.updateSettingsBody = [];
  }

  open(subjectId: string | number, classDetails: ClassDetails) {
    if (classDetails) {
      this.subjectId = subjectId;
      this.classId = classDetails.id;
      this.classGrade = classDetails.class_grade;
      this.classLetter = classDetails.class_letter;
      this.allowsExemption = classDetails.taught_subjects[findIndex(classDetails.taught_subjects, {id: this.subjectId})].allows_exemption;
      this.isOptional = classDetails.taught_subjects[findIndex(classDetails.taught_subjects, {id: this.subjectId})].is_optional;
      if (this.subjectId) {
        this.fetchSettingsData();
        this.modal.open();
      }
    }
  }

  changeValue(studentSettings: StudentSettings, key: string, index: number) {
    this.classSettings[index][key] = !this.classSettings[index][key];
    const searchedIndex = findIndex(this.updateSettingsBody, {id: studentSettings.id});
    if (searchedIndex !== -1) {
      this.updateSettingsBody[searchedIndex][key] = this.classSettings[index][key];
    } else {
      const {student, ...settings} = studentSettings;
      this.updateSettingsBody.push(settings);
    }
  }

  toggleSettingForAll(key: string) {
    this.isGloballySelected[key] = !this.isGloballySelected[key];
    this.classSettings.forEach((student, i) => {
      if (this.classSettings[i][key] != this.isGloballySelected[key]) {
        this.changeValue(student, key, i);
      }
    });
  }
}
