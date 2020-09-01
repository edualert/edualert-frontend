import {IdName} from './id-name';

export class InstitutionAtRisk extends IdName {

  students_at_risk_count: number;

  constructor(object?: any) {
    super(object);
    this.students_at_risk_count = object?.students_at_risk_count;
  }

}

export class InactiveInstitution extends IdName {

  last_change_in_catalog: string;

  constructor(object?: any) {
    super(object);
    this.last_change_in_catalog = object?.last_change_in_catalog;
  }
}
