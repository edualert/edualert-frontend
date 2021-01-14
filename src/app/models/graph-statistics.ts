export class GraphStatistics {
  day: number;
  weekday: string;
  count: number;

  constructor(object?: any) {
    this.day = object?.day;
    this.weekday = object?.weekday;
    this.count = object?.count;
  }

}

export class AbsencesStatistics extends GraphStatistics {
  total_count: number;
  unfounded_count: number;
  founded_count: number;

  constructor(object?: any) {
    super(object);
    this.total_count = object?.total_count;
    this.unfounded_count = object?.unfounded_count;
    this.founded_count = object?.founded_count;
  }
}
