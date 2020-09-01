import {Component, HostListener, Injector, Input} from '@angular/core';
import {SchoolCategory, SchoolDetail, SchoolDetailRequiredFields} from '../../../models/school-details';
import {cities} from '../../../data/cities';
import {districts} from '../../../data/districts';
import {capitalizeString} from '../../../shared/utils';
import {findIndex} from 'lodash';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SchoolCategoriesService} from '../../../services/school-categories.service';
import {SchoolNamesService} from '../../../services/school-names.service';
import {SchoolPrincipalsService} from '../../../services/school-principals.service';
import {SchoolPrincipal} from '../../../models/school-principal';
import {SchoolProfilesService} from '../../../services/school-profiles-service';
import {IdName} from '../../../models/id-name';
import {IdText} from '../../../models/id-text';
import {InputValidator} from '../../../services/field-validation';

class DropdownData {
  districts: IdText[];
  cities: { id, text, district }[];
  categories: SchoolCategory[];
  academic_profiles: IdName[];
  school_principals: SchoolPrincipal[];
  names: IdName[];
}

@Component({
  selector: 'app-add-edit-schools',
  templateUrl: './add-edit-schools.component.html',
  styleUrls: ['./add-edit-schools.component.scss', './shared-add-edit-styles.scss']
})
export class AddEditSchoolsComponent {
  readonly httpClient: HttpClient;
  readonly activatedRoute: ActivatedRoute;
  readonly router: Router;
  readonly schoolCategoriesService: SchoolCategoriesService;
  readonly schoolNamesService: SchoolNamesService;
  readonly schoolProfilesService: SchoolProfilesService;
  readonly schoolPrincipalsService: SchoolPrincipalsService;
  @Input() isEditable: boolean;

  schoolDetails: SchoolDetail;
  schoolDetailsError = new SchoolDetailRequiredFields();
  hasUnfilledFields = false;
  hasUnsavedData = false;
  hasModifiedData = false;
  schoolId: Params;

  data: DropdownData = {
    // Commented for MVP (just 'Cluj' district and 'Cluj-Napoca' city should be available)
    // districts: Object.keys(districts).map((districtName) => ({id: districtName, text: capitalizeString(districtName, [' ', '-'])})),
    // cities: cities,
    districts: [{id: 'cluj', text: 'Cluj'}],
    cities: [{'id':'cluj-napoca','text':'Cluj-Napoca','district':'cluj'}],
    categories: [],
    names: [],
    academic_profiles: [],
    school_principals: [],
  };

  constructor(injector: Injector) {
    this.httpClient = injector.get(HttpClient);
    this.schoolProfilesService = injector.get(SchoolProfilesService);
    this.activatedRoute = injector.get(ActivatedRoute);
    this.router = injector.get(Router);
    this.schoolCategoriesService = injector.get(SchoolCategoriesService);
    this.schoolNamesService = injector.get(SchoolNamesService);
    this.schoolPrincipalsService = injector.get(SchoolPrincipalsService);

    this.schoolCategoriesService.getData(false).subscribe((response) => {
      this.data.categories = response;
    });
    this.schoolNamesService.getDataUregisteredSchools(true).subscribe((response) => {
      this.data.names = response;
    });
    this.schoolPrincipalsService.getData(true).subscribe((response) => {
      this.data.school_principals = response;
    });
  }

  @HostListener('window:beforeunload')
  refreshGuard($event): void {
    if (this.hasModifiedData) {
      $event.returnValue = '\0';
    }
  }

  handleInputChange(object, key) {
    switch (key) {
      case 'district':
        // Commented for MVP (just 'Cluj' district and 'Cluj-Napoca' city should be available)
        // this.data.cities = object?.element?.id ? cities.filter(city => city.district === object?.element?.id) : cities;
        this.schoolDetails.city = null;
        this.schoolDetails.district = object?.element?.text;
        this.schoolDetailsError.district = '';
        this.inputChanged();
        break;
      case 'city':
        // Commented for MVP (just 'Cluj' district and 'Cluj-Napoca' city should be available)
        // this.schoolDetails.city = cities[findIndex(cities, {id: object?.element?.id})].text;
        this.schoolDetails.city = 'Cluj-Napoca';
        this.schoolDetailsError.city = '';
        this.inputChanged();
        break;
      case 'categories':
        this.schoolDetails.categories = [];
        if (object.length > 0) {
          for (const selection of object) {
            this.schoolDetails.categories.push(this.data.categories[findIndex(this.data.categories, {id: selection?.element?.id})]);
          }
          this.schoolDetailsError['academic_profile'] = '';
          this.getAcademicProfiles();
        } else {
          this.data.academic_profiles = [];
          this.schoolDetails.academic_profile = null;
        }
        this.schoolDetailsError.categories = '';
        this.inputChanged();
        break;
      case 'school_principal':
        this.dropdownInputChanged(key, object, false);
        break;
      case 'academic_profile':
        this.dropdownInputChanged(key, object, false);
        break;
      case 'name':
        this.dropdownInputChanged(key, object, true);
        break;
      default:
        this.schoolDetails[key] = this.data[key + 's'][findIndex(this.data[key + 's'], {id: object?.element?.id})].text;
        this.inputChanged();
    }
  }

  dropdownInputChanged(key: string, object, elementIsString: boolean): void {
    if (elementIsString) {
      this.schoolDetails[key] = this.data[key + 's'][findIndex(this.data[key + 's'], {id: object?.element?.id})][key];
    } else {
      this.schoolDetails[key] = this.data[key + 's'][findIndex(this.data[key + 's'], {id: object?.element?.id})];
    }
    this.schoolDetailsError[key] = '';
    this.inputChanged();
  }

  addInput(object: {}, key: string): void {
    this.schoolDetails[key] = object;
    this.schoolDetailsError[key] = '';
    this.inputChanged();
  }

  checkObject(dict, requiredFields): void {
    this.hasUnfilledFields = false;
    Object.keys(requiredFields)
      .forEach(key => {
        if (key === 'academic_profile' && this.data.academic_profiles.length === 0) {
          return;
        }
        const data = dict[key];
        if (requiredFields.hasOwnProperty(key) && data) {
          if (typeof data !== 'object') {
            let inputError = InputValidator.isRequiredError(data);
            if ( inputError ) {
              requiredFields[key] = inputError ? inputError : '';
              this.hasUnfilledFields = true;
            }
            if (key === 'phone_number') {
              inputError = InputValidator.isRequiredError(data) || InputValidator.validatePhoneNumber(data);
              if (inputError) {
                requiredFields[key] = inputError;
                this.hasUnfilledFields = true;
              }
            }
            if (key === 'email') {
              inputError = InputValidator.validateEmail(data);
              if (inputError) {
                requiredFields[key] = inputError ? inputError : '';
                this.hasUnfilledFields = true;
              }
            }
          } else {
            if (Array.isArray(data)) {
              const listError = InputValidator.listHasElements(data);
              if (listError) {
                requiredFields[key] = listError ? listError : '';
                this.hasUnfilledFields = true;
              }
            }
          }
        } else {
          requiredFields[key] = 'Acest camp este obligatoriu.';
          this.hasUnfilledFields = true;
        }
      });
  }

  inputChanged(): void {
    this.hasUnsavedData = true;
    this.hasModifiedData = true;
  }

  getAcademicProfiles(): void {
    let requestPath = 'school-units-profiles/?';
    for (const category of this.schoolDetails.categories) {
      requestPath = requestPath + 'category=' + category.id + '&';
    }
    requestPath = requestPath.slice(0, -1);
    this.schoolProfilesService.getData(true, requestPath).subscribe((response) => {
      if (response.length > 0) {
        this.data.academic_profiles = response;
      } else {
        this.data.academic_profiles = [];
        this.schoolDetails.academic_profile = null;
      }
    });
  }
}
