import { Component, OnChanges, OnInit, OnDestroy, Input, ElementRef, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { getMonthsInInterval, weekDays, getDatesInIntervalByWeekDays, mapWeeksToMonths, getDatesInIntervalByMonths } from './calendar-utils';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnChanges, OnInit, OnDestroy {
	@Input() startDate: string;
	@Input() endDate: string;
	@Input() eventList: any;
	@Input() eventTypeMapping: any;
  @Input() locale?: string;
  @Input() enforceDates: boolean;
  @Input() isNarrow: boolean;
  @Input() ignoreLimitDates: boolean;
  @ViewChild('rootElement') rootElement: ElementRef;
	private _internalStartDate?: moment.Moment = null;
	private _internalEndDate?: moment.Moment = null;
	private _absoluteStartDate?: moment.Moment = null;
	private _absoluteEndDate?: moment.Moment = null;
	private _internalEventList: any = null;
  private _calendarWidth?: number = null;
  private _elementsInRow?: number = null;
  private _internalCalendarMapping: any = null;
  private _internalMonthlyCalendarMapping?: {string?: moment.Moment[]} = null;
  private _months?: string[] = null;
  
  isMobile?: boolean = null;
	public calendarMapping: any = [];
  public weekDays: string[] = null;

  keepOrder = (a, b) => a;

  constructor(private hostElement: ElementRef) {}

  ngOnInit(): void {
    window.addEventListener('resize', () => this.generateRows());
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.generateRows);
  }

  ngOnChanges(): void {
  	if (!this.startDate || !this.endDate) {
      if (this.enforceDates) {
  		  throw "No interval specified! Please set the startDate and endDate props";
      }
  	}
  	else {
      this.isMobile = window.innerWidth <= 500;

  		if (!this.locale) {
        this.locale = 'ro';
      }

      this.weekDays = weekDays(this.locale);
  		this._internalStartDate = moment(this.startDate, "DD-MM-YYYY").locale(this.locale);
  		this._internalEndDate = moment(this.endDate, "DD-MM-YYYY").locale(this.locale);
  		this._absoluteStartDate = moment(this._internalStartDate.clone().startOf("month"), "DD-MM-YYYY").locale(this.locale); //startOf/endOf seems to mutate the calling instance to the start/end of month respectively when called
  		this._absoluteEndDate = moment(this._internalEndDate.clone().endOf("month"), "DD-MM-YYYY").locale(this.locale);
  		
      const tempMonthMapping = getDatesInIntervalByMonths(this._absoluteStartDate, this._absoluteEndDate);
      this._months = getMonthsInInterval(this._internalStartDate, this._internalEndDate);
      this._internalMonthlyCalendarMapping = {};
      this._months.forEach((month, index) => {
        this._internalMonthlyCalendarMapping[month] = tempMonthMapping[index].map(element => {
          return {eventType: -1, value: element};
        });
      });

      this._internalCalendarMapping = mapWeeksToMonths(
  			getDatesInIntervalByWeekDays(this._absoluteStartDate, this._absoluteEndDate, this.locale),
  			this._months,
  			this.weekDays
  		);
      this.postProcessCalendarMappingPipeline();
    }

  	if (this.eventList) {
  		this._internalEventList = [...this.eventList];
      this._internalEventList.forEach(event => {
        event.startDate = moment(event.startDate, "DD-MM-YYYY").locale(this.locale);
        event.endDate = moment(event.endDate, "DD-MM-YYYY").locale(this.locale);
      });
      this.preSetEventTypesOnInternalMonthlyMapping();
    }
  }

  preSetEventTypesOnInternalMonthlyMapping(): void {
    let i = 0;

    this._months.forEach(monthName => {
      this._internalMonthlyCalendarMapping[monthName].forEach(date => {
        if (!this.ignoreLimitDates && (date.value.isSame(this._internalStartDate) || date.value.isSame(this._internalEndDate))) {
          return;
        }

        i = 0;
        while (i < this._internalEventList.length) {
          if (date.value.isSame(this._internalEventList[i].startDate) || 
            (date.value.isAfter(this._internalEventList[i].startDate) && date.value.isBefore(this._internalEventList[i].endDate)) ||
            date.value.isSame(this._internalEventList[i].endDate)) {
            date.eventType = this._internalEventList[i].eventType;
            break;
          }
          i++;
        }
      })
    })
  }

  decideStyleClass(date: moment.Moment, monthName: string): Object {
  	const cellStyleObj = {
  		background: 'white',
  		color: '#B7BDC5'
  	};

  	if (this._internalEventList.length && this.eventTypeMapping) {
  		if (!this.ignoreLimitDates && (date.isSame(this._internalStartDate) || date.isSame(this._internalEndDate))) {
  			cellStyleObj.color = 'white';
  			cellStyleObj.background = this.eventTypeMapping[0].color;
  			return cellStyleObj;
  		}

	  	let i = 0;
	  	while (i < this._internalEventList.length) {
	  		if (date.isSame(this._internalEventList[i].startDate) || 
	  			(date.isAfter(this._internalEventList[i].startDate) && date.isBefore(this._internalEventList[i].endDate)) ||
	  			date.isSame(this._internalEventList[i].endDate)) {
	  			cellStyleObj.color = 'white';
	  			cellStyleObj.background = this.eventTypeMapping[this._internalEventList[i].eventType].color;
          cellStyleObj['borderRadius'] = this.postProcessCellStyle(date, monthName, this._internalEventList[i].eventType);
          return cellStyleObj;
	  		}
	  		i++;
	  	}
	  }
    if (date.isBefore(this._internalStartDate) || date.isAfter(this._internalEndDate) || [5,6].includes(date.weekday())) { //weekend here is locale dependant on RO
      return cellStyleObj;
    }

  	cellStyleObj.color = '#4B5B6E';
  	return cellStyleObj;
  }

  postProcessCellStyle(date: moment.Moment, monthName: string, eventType: any): string { //weekend here is locale dependant on RO
    const positionOfDate = this._internalMonthlyCalendarMapping[monthName].findIndex(element => element.value.isSame(date));
    const bottomDate = positionOfDate + 1;
    const topDate = positionOfDate - 1;
    const leftDate = positionOfDate - 7;
    const rightDate = positionOfDate + 7;
    let topLeft = "5px";
    let topRight = "5px";
    let bottomLeft = "5px";
    let bottomRight = "5px";

    if (bottomDate < this._internalMonthlyCalendarMapping[monthName].length && this._internalMonthlyCalendarMapping[monthName][bottomDate].eventType === eventType && date.weekday() !== 6) {
      bottomLeft = "0";
      bottomRight = "0";
    }
    if (topDate >= 0 && this._internalMonthlyCalendarMapping[monthName][topDate].eventType === eventType && date.weekday() !== 0) {
      topLeft = "0";
      topRight = "0";
    }
    if (leftDate >= 0 && this._internalMonthlyCalendarMapping[monthName][leftDate].eventType === eventType) {
      bottomLeft = "0";
      topLeft = "0";
    }
    if (rightDate < this._internalMonthlyCalendarMapping[monthName].length && this._internalMonthlyCalendarMapping[monthName][rightDate].eventType === eventType) {
      bottomRight = "0";
      topRight = "0";
    }

    return `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`;
  }

  postProcessCalendarMappingPipeline(): void {
    this.normalizeWeekLength();
    this.ensureFirstDateIsColumnStart();
    this.generateRows();
  }

  normalizeWeekLength(): void {
    Object.keys(this._internalCalendarMapping).forEach(month => {
      const weekDaysLenghts = Object.values(this._internalCalendarMapping[month]).map((dates: any[]) => dates.length);
      const maxLenght = Math.max.apply(Math, weekDaysLenghts);
      const indexOfMaxLength = weekDaysLenghts.indexOf(maxLenght);
      Object.values(this._internalCalendarMapping[month]).forEach((dates: any[], index) => {
        if (index < indexOfMaxLength && weekDaysLenghts[index] < maxLenght) {
          dates.unshift("");
        }
        else if (index > indexOfMaxLength && weekDaysLenghts[index] < maxLenght) {
          dates.push("");
        }
      });
    });
  }

  ensureFirstDateIsColumnStart(): void {    // refering to the 1st of each month
    Object.keys(this._internalCalendarMapping).forEach(month => {
      let firstFound = false;

      Object.values(this._internalCalendarMapping[month]).forEach((dates: any[], index) => {
        if (firstFound) {
          return
        }
          firstFound = (dates.findIndex(element => element && element.format("D") === "1") !== -1);

        if (!firstFound && dates[0]) {
          dates.unshift("");
        }
      });
    });
  }

  generateRows(): void {
    if (window.innerWidth > 500) {
      let currentWidth = this.hostElement.nativeElement.getBoundingClientRect().width;
      if (!currentWidth && this.rootElement && this.rootElement.nativeElement.getBoundingClientRect().width) {
        currentWidth = this.rootElement.nativeElement.getBoundingClientRect().width;
      }
      if (!currentWidth) {
        currentWidth = window.innerWidth > 1024 ? window.innerWidth - 460 : window.innerWidth - 45; // during initialization elements have no width TODO: find a better way to do this
      }

      if (!this._calendarWidth) {
          this._calendarWidth = currentWidth;
      }
      else if (Math.abs(this._calendarWidth - currentWidth) > 100 
        || this._elementsInRow !==  Math.floor((currentWidth - 90) / 157) || this.isMobile) {
        this._calendarWidth = currentWidth;
      }
      else {
        this.isMobile = window.innerWidth <= 500;
        return;
      }

      if (this._elementsInRow !==  Math.floor((currentWidth - 90) / 157) || this.isMobile) {
        this._elementsInRow = Math.floor((this._calendarWidth - 90) / 157);
        let newMapping = [];
        let currentLength = 0;
        let rowMapping = {};

        Object.entries(this._internalCalendarMapping).forEach(([key, value]) => {
          rowMapping[key] = value;
          currentLength++;

          if (currentLength >= this._elementsInRow) {
            newMapping.push(rowMapping);
            currentLength = 0;
            rowMapping = {};
          }
        })
        if (Object.keys(rowMapping).length) {
          newMapping.push(rowMapping);
        }

        this.calendarMapping = newMapping;
      }
    }
    else {
      this.calendarMapping = this._internalCalendarMapping;
    }
    this.isMobile = window.innerWidth <= 500;
  }
}
