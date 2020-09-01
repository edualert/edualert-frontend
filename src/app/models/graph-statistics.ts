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
  unfounded_count: number;

  constructor(object?: any) {
    super(object);
    this.unfounded_count = object?.unfounded_count;
  }
}
