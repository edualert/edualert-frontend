import {ActivatedRoute, Params, Router} from '@angular/router';
import {Injector} from '@angular/core';
import {getAvailableAcademicYears, getCurrentAcademicYear} from '../../shared/utils';
import {findIndex} from 'lodash';
import {SchoolCategoriesService} from '../../services/school-categories.service';
import {forkJoin, Observable, of} from 'rxjs';
import {userRolesArray} from '../../models/user-roles';
import {userStatuses} from '../../models/user-statuses';
import {AccountService} from '../../services/account.service';
import {IdName} from '../../models/id-name';
import {IdText} from '../../models/id-text';
import {catchError, map} from 'rxjs/operators';
import {cloneDeep} from 'lodash';
import * as moment from 'moment';
import {SchoolUnitsProfilesService} from '../../services/school-units-profiles.service';
import {GenericAcademicProgramsService} from '../../services/generic-academic-programs.service';
import {studentsSituationSortCriteria} from '../../data/studets-situation-sort-criteria';
import {AvailableClassNamesService} from '../../services/available-class-names.service';
import {ScrollableList} from './scrollable-list';
import {classListDetailSortCriteria} from '../../data/class-detail-sort-criteria';
import {CurrentAcademicYearService} from '../../services/current-academic-year.service';
import {AcademicYearCalendar} from '../../models/academic-year-calendar';
import {StudentRemarksService} from '../../services/student-remarks.service';

class FilterData {
  districts: IdText[] = null;
  cities: { id, text, district }[] = null;
  schoolCategories: IdName[] = null;
  schoolProfiles: IdName[] = null;
  academicYears: IdText[] = null;
  userRoles: IdText[] = null;
  userStatuses: { key, name }[] = null;
  studyClassGrades: string[] = null;
  genericAcademicPrograms: IdName[] = null;
  sortCriteria: IdText[] = null;
}

class FilterParams {
  search: string;
  district: IdText;
  city: { id, text, district };
  schoolCategory: IdName;
  schoolProfile: IdName;
  academicYear: IdText = new IdText();
  userRole: IdText = new IdText();
  userStatus: { key, name } = {key: null, name: null};
  createdDate: string; // DD-MM-YYYY
  studyClassGrade: string;
  genericAcademicProgram: IdName;
  sortCriterion: IdText;
}

// All subclasses of ListPage need to call super(injector) for the base class's services to work
export class ListPage extends ScrollableList {
  readonly router: Router;
  readonly activatedRoute: ActivatedRoute;
  readonly schoolCategoriesService: SchoolCategoriesService;
  readonly schoolUnitsProfilesService: SchoolUnitsProfilesService;
  readonly userService: AccountService;
  readonly studyClassAvailableGradesService: AvailableClassNamesService;
  readonly genericAcademicProgramsService: GenericAcademicProgramsService;
  readonly currentAcademicYearService: CurrentAcademicYearService;
  readonly studentRemarksService: StudentRemarksService;

  private readonly defaultFilterData;

  filterData: FilterData = new FilterData();
  filterParams: FilterParams = new FilterParams();
  requestInProgress: boolean;
  academicYearToRequest: string = getCurrentAcademicYear().toString();

  // Fields for scrollHandle:
  initialBodyHeight: number;
  elementCount: number;
  totalCount: number;
  initialRequestInProgress: boolean;
  requestedPageCount: number = 1;
  activeUrlParams: Params;
  requestDataFunc: any;
  keepOldList: boolean = false;


  constructor(injector: Injector) {
    super();

    this.router = injector.get(Router);
    this.studentRemarksService = injector.get(StudentRemarksService);
    this.activatedRoute = injector.get(ActivatedRoute);
    this.schoolCategoriesService = injector.get(SchoolCategoriesService);
    this.schoolUnitsProfilesService = injector.get(SchoolUnitsProfilesService);
    this.userService = injector.get(AccountService);
    this.studyClassAvailableGradesService = injector.get(AvailableClassNamesService);
    this.genericAcademicProgramsService = injector.get(GenericAcademicProgramsService);
    this.currentAcademicYearService = injector.get(CurrentAcademicYearService);

    this.currentAcademicYearService.getData().subscribe((academicYearCalendar: AcademicYearCalendar) => {
      this.academicYearToRequest = academicYearCalendar.academic_year.toString();
    });

    this.defaultFilterData = {
      // Commented for MVP (just 'Cluj' district and 'Cluj-Napoca' city should be available)
      // districts: Object.keys(districts).map((districtName) => ({id: districtName, text: capitalizeString(districtName, [' ', '-'])})),
      // cities: cities,
      districts: [{id: 'cluj', text: 'Cluj'}],
      cities: [{'id': 'cluj-napoca', 'text': 'Cluj-Napoca', 'district': 'cluj'}],
      schoolCategories: this.schoolCategoriesService.getData(true).pipe(catchError(() => of(null))),
      schoolProfiles: this.schoolUnitsProfilesService.getData(true).pipe(catchError(() => of(null))),
      academicYears: getAvailableAcademicYears().map(element => ({id: element, text: `${element} - ${element + 1}`})),
      userRoles: userRolesArray,
      userStatuses: userStatuses,
      studyClassGrades: this.studyClassAvailableGradesService.getData(true).pipe(map(response => {
        return [...new Set(response)];
      }), catchError(() => of(null))),
      genericAcademicPrograms: this.genericAcademicProgramsService.getData(true).pipe(catchError(() => of(null))),
      sortCriteria: this.activatedRoute.snapshot.url[2]?.path === 'class-detail' ? classListDetailSortCriteria : studentsSituationSortCriteria
    };
  }


  // the value of filters can be an Observable or any other value (if null, will set value from this.defaultFilters)
  protected initFilters(filters: { [key: string]: ((...args) => any) | Observable<any> | any }): void {

    // Only some filters need data from backend (such as schoolProfiles or schoolCategories)
    const dataToRequest: { [key: string]: Observable<any> } = {};

    // Go through all the specified filters and decide what to do with the data.
    Object.keys(filters).forEach((key) => {
      const value = filters[key] || this.defaultFilterData[key];
      if (value instanceof Observable) {
        dataToRequest[key] = value; // remember it for the requests forkJoin below.
      } else {
        this.filterData[key] = value; // just set it
      }
    });

    // if Observables were found, subscribe to them and set their results into this.filterData
    if (Object.keys(dataToRequest).length) {
      forkJoin(dataToRequest).subscribe((results: object) => {
        Object.keys(results).forEach((filterKey) => {
          this.filterData[filterKey] = results[filterKey];
        });
        this.handleRouteParamsChange();
      });
    } else {
      this.handleRouteParamsChange();
    }
  }

  private handleRouteParamsChange() {
    this.activatedRoute.queryParams.subscribe((urlParams: any) => {
      // Commented for MVP (just 'Cluj-Napoca' should be available)
      // if (urlParams.district !== this.filterParams.district?.id) {
      //   this.filterData.cities = urlParams.district ? cities.filter(city => city.district === urlParams.district) : cities;
      // }
      this.filterParams.search = urlParams.search;
      this.filterParams.createdDate = urlParams.createdDate;
      this.filterParams.district = urlParams.district && this.filterData.districts[findIndex(this.filterData.districts, {id: urlParams.district})];
      this.filterParams.city = urlParams.city && this.filterData.cities[findIndex(this.filterData.cities, {id: urlParams.city})];
      this.filterParams.schoolCategory = urlParams.schoolCategory && this.filterData.schoolCategories[findIndex(this.filterData.schoolCategories, {id: parseInt(urlParams.schoolCategory, 10)})];
      this.filterParams.schoolProfile = urlParams.schoolProfile && this.filterData.schoolProfiles[findIndex(this.filterData.schoolProfiles, {id: parseInt(urlParams.schoolProfile, 10)})];
      this.filterParams.academicYear = urlParams.academicYear && this.filterData.academicYears[findIndex(this.filterData.academicYears, {id: parseInt(urlParams.academicYear, 10)})];
      this.filterParams.userRole = urlParams.user_role && this.filterData.userRoles[findIndex(this.filterData.userRoles, {id: urlParams.user_role})];
      this.filterParams.userStatus = urlParams.is_active && this.filterData.userStatuses[findIndex(this.filterData.userStatuses, {key: urlParams?.is_active !== undefined ? Boolean(JSON.parse(urlParams?.is_active)) : undefined})];
      this.filterParams.studyClassGrade = urlParams.studyClassGrade;
      this.filterParams.genericAcademicProgram = urlParams.academicProgram && this.filterData.genericAcademicPrograms[findIndex(this.filterData.genericAcademicPrograms, {id: parseInt(urlParams.academicProgram, 10)})];
      this.filterParams.sortCriterion = urlParams.ordering && this.filterData.sortCriteria[findIndex(this.filterData.sortCriteria, {id: urlParams.ordering})];
    });
  }

  // Methods to change the url params:
  changeSearch(search: string): void {
    if (!search || search.length === 0) {
      search = null;
    }
    this.changeUrlParams({search: search});
  }

  changeDistrict(value): void {
    this.changeUrlParams({'district': value?.id, city: undefined});
  }

  changeCity(value): void {
    this.changeUrlParams({'city': value?.id});
  }

  changeSchoolCategory(value): void {
    this.changeUrlParams({'schoolCategory': value?.id});
  }

  changeSchoolProfile(value): void {
    this.changeUrlParams({'schoolProfile': value?.id});
  }

  changeAcademicYear(value): void {
    this.changeUrlParams({'academicYear': value?.id});
  }

  changeUserRole(value): void {
    this.changeUrlParams({'user_role': value?.id});
  }

  changeUserStatus(value): void {
    this.changeUrlParams({'is_active': value?.key});
  }

  changeCreatedDate(value: string): void {
    this.changeUrlParams({'createdDate': moment(value).format('DD-MM-YYYY')});
  }

  changeStudyClassGrade(value): void {
    this.changeUrlParams({'studyClassGrade': value});
  }

  changeGenericAcademicProfile(value): void {
    this.changeUrlParams({'academicProgram': value?.id});
  }

  changeSortingCriterion(value): void {
    this.changeUrlParams({'ordering': value?.id});
  }

  customUrlParamsChange(params) {
    this.changeUrlParams(params);
  }

  deleteFilters() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
    });
  }

  private changeUrlParams(newParams: object): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: newParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

}
