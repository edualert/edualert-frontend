export class ChildStatistics {

  avg_sem1: number;
  avg_annual: number;
  behavior_grade_sem1: number;
  behavior_grade_annual: number;
  behavior_grade_limit: number;
  abs_count_sem1: number;
  abs_count_annual: number;
  founded_abs_count_sem1: number;
  founded_abs_count_annual: number;
  unfounded_abs_count_sem1: number;
  unfounded_abs_count_annual: number;
  class_place_by_avg_sem1: number;
  class_place_by_avg_annual: number;
  school_place_by_avg_sem1: number;
  school_place_by_avg_annual: number;
  class_place_by_abs_sem1: number;
  class_place_by_abs_annual: number;
  school_place_by_abs_sem1: number;
  school_place_by_abs_annual: number;

  constructor(object?: any) {
    this.avg_sem1 = object?.avg_sem1;
    this.avg_annual = object?.avg_annual;
    this.behavior_grade_sem1 = object?.behavior_grade_sem1;
    this.behavior_grade_annual = object?.behavior_grade_annual;
    this.behavior_grade_limit = object?.behavior_grade_limit;
    this.abs_count_sem1 = object?.abs_count_sem1;
    this.abs_count_annual = object?.abs_count_annual;
    this.founded_abs_count_sem1 = object?.founded_abs_count_sem1;
    this.founded_abs_count_annual = object?.founded_abs_count_annual;
    this.unfounded_abs_count_sem1 = object?.unfounded_abs_count_sem1;
    this.unfounded_abs_count_annual = object?.unfounded_abs_count_annual;
    this.class_place_by_avg_sem1 = object?.class_place_by_avg_sem1;
    this.class_place_by_avg_annual = object?.class_place_by_avg_annual;
    this.school_place_by_avg_sem1 = object?.school_place_by_avg_sem1;
    this.school_place_by_avg_annual = object?.school_place_by_avg_annual;
    this.class_place_by_abs_sem1 = object?.class_place_by_abs_sem1;
    this.class_place_by_abs_annual = object?.class_place_by_abs_annual;
    this.school_place_by_abs_sem1 = object?.school_place_by_abs_sem1;
    this.school_place_by_abs_annual = object?.school_place_by_abs_annual;
  }

}

export class ChildSchoolActivity {

  date: string;
  subject_name: string;
  event_type: string;
  event: string;
  is_coordination_subject: boolean;
  behavior_grade_limit: number;
  grade_limit: number;
  grade_value: number;

  constructor(object?: any) {
    this.date = object?.date;
    this.subject_name = object?.subject_name;
    this.event_type = object?.event_type;
    this.event = object?.event;
    this.is_coordination_subject = object?.is_coordination_subject;
    this.behavior_grade_limit = object?.behavior_grade_limit;
    this.grade_limit = object?.grade_limit;
    this.grade_value = object?.grade_value;
  }

}

export class SubjectForChild {

  id: number;
  subject_name: string;
  avg_sem1: number;
  avg_final: number;
  avg_limit: number;
  unfounded_abs_count_sem1: number;
  unfounded_abs_count_annual: number;
  third_of_hours_count_sem1: number;
  third_of_hours_count_annual: number;

  constructor(object?: any) {
    this.avg_final = object?.avg_final;
    this.avg_sem1 = object?.avg_sem1;
    this.avg_limit = object?.avg_limit;
    this.id = object?.id;
    this.subject_name = object?.subject_name;
    this.unfounded_abs_count_annual = object?.unfounded_abs_count_annual;
    this.unfounded_abs_count_sem1 = object?.unfounded_abs_count_sem1;
    this.third_of_hours_count_annual = object?.third_of_hours_count_annual;
    this.third_of_hours_count_sem1 = object?.third_of_hours_count_sem1;
  }

}
