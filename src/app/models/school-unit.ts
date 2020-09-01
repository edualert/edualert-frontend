import {IdName} from './id-name';

export class SchoolUnit {
  id: number;
  name: string;
  categories: IdName[];
  academic_profile: string;
  is_active: boolean;
  district: string;
  city: string;

  constructor(obj) {
    if (obj) {
      this.id = obj.id;
      this.name = obj.name;
      this.categories = obj.categories.map(category => new IdName(category));
      this.academic_profile = obj.academic_profile;
      this.is_active = obj.is_active;
      this.district = obj.district;
      this.city = obj.city;
    }
  }
}
