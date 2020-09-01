import {SchoolPrincipal} from './school-principal';
import {IdName} from './id-name';

export const MY_OWN_SCHOOL_CATEGORY_LEVELS_GRADES = [
  {
    category: 'HIGHSCHOOL',
    classes: ['IX', 'X', 'XI', 'XII', 'XIII']
  },
  {
    category: 'SECONDARY_SCHOOL',
    classes: ['V', 'VI', 'VII', 'VIII']
  },
  {
    category: 'PRIMARY_SCHOOL',
    classes: ['0', 'I', 'II', 'III', 'IV']
  }
];

export class SchoolCategory extends IdName {
  category_level: string;

  constructor(object?: any) {
    super(object);
    this.category_level = object?.category_level;
  }

}

export class SchoolDetailRequiredFields {
  city = '';
  district = '';
  name = '';
  categories = '';
  academic_profile = '';
  address = '';
  phone_number = '';
  email = '';
  school_principal = '';
}

export class SchoolDetail {

  categories: SchoolCategory[];
  academic_profile: IdName;
  address: string;
  phone_number: string;
  email: string;
  school_principal: SchoolPrincipal;
  district: string;
  city: string;
  name: string;
  id: number;
  is_active: boolean;

  constructor(data?) {
    this.categories = data && data.categories ?
      (Array.isArray(data.categories) ?
        data.categories.map(category => {
          return new IdName(category);
        })
        : [new IdName(data.categories)])
      : [];

    this.academic_profile = data && data.academic_profile ? data.academic_profile : null;
    this.address = data && data.address ? data.address : null;
    this.phone_number = data && data.phone_number ? data.phone_number : null;
    this.email = data && data.email ? data.email : null;
    this.school_principal = new SchoolPrincipal(data) && data.class_master ? data.class_master : null;
    this.district = data && data.district ? data.district : null;
    this.city = data && data.city ? data.city : null;
    this.name = data && data.name ? data.name : null;
    this.id = data && data.id ? data.id : null;
    this.is_active = data && data.is_active ? data.is_active : null;
  }

}
