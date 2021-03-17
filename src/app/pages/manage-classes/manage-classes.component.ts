import {Component, Injector, ViewChild} from '@angular/core';
import {StudyClass} from '../../models/study-class';
import {ListPage} from '../list-page/list-page';
import {HttpClient} from '@angular/common/http';
import {Params} from '@angular/router';
import {getCurrentAcademicYear} from '../../shared/utils';
import {NetworkingListResponse} from '../../models/networking-list-response';
import {ConfirmationModalComponent} from '../../shared/confirmation-modal/confirmation-modal.component';
import * as moment from 'moment';
import {IdText} from '../../models/id-text';
import {AddNewUserModalComponent} from '../manage-users/add-new-user-modal/add-new-user-modal.component';
import {StudyClassAvailableGradesList} from '../../services/study-class.service';
import {StudyClassName} from '../../models/study-class-name';
import {YearGrades} from '../../models/year-grades';
import {AcademicYearCalendarService} from '../../services/academic-year-calendar.service';
import {AcademicYearCalendar} from '../../models/academic-year-calendar';
import {CloneClassService} from '../../services/clone-class.service';


@Component({
  selector: 'app-manage-classes',
  templateUrl: './manage-classes.component.html',
  styleUrls: ['./manage-classes.component.scss', './classes-general-styles.scss']
})
export class ManageClassesComponent extends ListPage {
  classes?: { string?: StudyClass[] } = null;
  availableClassesForCurrentAcademicYear: StudyClassName[];
  isEditable: boolean;
  academicYearFromQueryParams: number;
  academicYearCalendar: AcademicYearCalendar;
  yearGrades = Object.keys(YearGrades);
  activeUrlParams: Params;
  readonly defaultAcademicYear: IdText = new IdText({id: getCurrentAcademicYear(), text: `${getCurrentAcademicYear()} - ${getCurrentAcademicYear() + 1}`});
  @ViewChild('appConfirmationModal', {static: false}) appConfirmationModal: ConfirmationModalComponent;
  @ViewChild('addNewUserModal', {static: false}) addNewUserModal: AddNewUserModalComponent;

  constructor(injector: Injector,
              private http: HttpClient,
              private studyClassAvailableGradesListService: StudyClassAvailableGradesList,
              private academicYearCalendarService: AcademicYearCalendarService,
              private cloneClassService: CloneClassService) {
    super(injector);

    this.initFilters({
      academicYears: null
    });

    this.activatedRoute.queryParams.subscribe((urlParams: Params) => {
      this.isEditable = urlParams['academicYear'] ? urlParams['academicYear'] === this.defaultAcademicYear.id.toString() : true;

      // TODO: To be uncommented after demo
      // this.isEditable = moment().isBefore(academicYearStart.clone().set('year', urlParams.academicYear || this.defaultAcademicYear.id));
      this.requestData(urlParams);
      this.activeUrlParams = urlParams;
    });
  }

  keepOrder = a => a;

  deleteClass(studyClass: StudyClass, sectionId: string, event?: any): void {
    // TODO: To be uncommented after demo
    // if (studyClass.has_previous_catalog_data || !this.isEditable) {
    //   return;
    // }

    event.stopPropagation();
    const modalData = {
      title: 'Vă rugăm confirmați',
      description: `Doriți să ștergeți clasa ${studyClass.class_grade} ${studyClass.class_letter}?`,
      cancelButtonText: 'NU',
      confirmButtonText: 'DA',
      confirmButtonCallback: () => {
        this.http.delete(`study-classes/${studyClass.id}/`).subscribe(() => {
          this.removeFromView(sectionId, studyClass.id);
        });
      }
    };
    this.appConfirmationModal.open(modalData);
  }

  shouldDisplayActionButtonsContainer(studyClass: StudyClass, section: {key: string, value: StudyClass[]}) {
    return this.isEditable;
    // Replaced the above line to temporarily disable clone class feature
    // return this.isEditable || this.shouldDisplayMoveButton(studyClass, section.key, section);
  }

  shouldDisplayMoveButton(studyClass: StudyClass, sectionId: string, section: any): boolean {
    const isFromPreviousAcademicYear = this.academicYearFromQueryParams + 1 === this.defaultAcademicYear.id;
    const isFinalGrade = ['IV', 'VIII', 'XII', 'XII'].includes(sectionId);
    let shouldDisplay = false;
    let isAlreadyCloned = false;
    let isFirstSemesterStarted = false;

    this.availableClassesForCurrentAcademicYear.forEach(availableClass => {
      let studyClassGradeIndex: number;
      let availableClassGradeIndex: number;
      studyClassGradeIndex = this.yearGrades.indexOf(studyClass.class_grade);
      availableClassGradeIndex = this.yearGrades.indexOf(availableClass.class_grade);

      if (studyClassGradeIndex === availableClassGradeIndex - 1
        && studyClass.class_letter === availableClass.class_letter) {
        isAlreadyCloned = true;
      }
    });

    if (moment().valueOf() > moment(this.academicYearCalendar.first_semester.starts_at).valueOf()) {
      isFirstSemesterStarted = true;
    }

    if (isFromPreviousAcademicYear && !isFinalGrade && !isAlreadyCloned /*&& isFirstSemesterStarted*/) { // commented for demo purposes
      shouldDisplay = true;
    }

    return shouldDisplay;
  }

  moveClass(studyClass: StudyClass): void {
    const path = `study-classes/${studyClass.id}/cloned-to-next-year/`;
    this.http.get(path).subscribe((response) => {
      this.cloneClassService.setClassObject(new StudyClass(response));
      this.router.navigate(['manage-classes', studyClass.id, 'edit'], {queryParams: {cloned: true}});
    });
  }

  private removeFromView(yearId: string, classId: number): void {
    const index = this.classes[yearId].findIndex(element => element.id === classId);
    this.classes[yearId].splice(index, 1);

    // if was the only class of that study year (aka IX, X etc.), delete the study year
    if (!this.classes[yearId].length) {
      delete this.classes[yearId];
    }

    // if was the only study year of the whole school, delete the object completely
    if (!Object.keys(this.classes).length) {
      this.classes = null;
    }
  }

  private requestData(urlParams: Params): void {
    this.requestInProgress = true;

    const path = `years/${urlParams.academicYear || this.defaultAcademicYear.id}/study-classes/`;
    this.http.get(path).subscribe((response: NetworkingListResponse) => {
      if (Object.keys(response).length) {
        this.classes = {};
        Object.keys(response).forEach(key => {
          this.classes[key] = response[key].map(element => new StudyClass(element));
        });
      } else {
        this.classes = null;
      }
      this.requestInProgress = false;
    });

    this.academicYearFromQueryParams = Number(this.activatedRoute.snapshot.queryParams.academicYear);
    this.studyClassAvailableGradesListService.getData(false, this.defaultAcademicYear.id.toString()).subscribe(classes => {
      this.availableClassesForCurrentAcademicYear = classes;
    });
    this.academicYearCalendarService.getData(false).subscribe(response => {
      this.academicYearCalendar = response;
    });
  }
}
