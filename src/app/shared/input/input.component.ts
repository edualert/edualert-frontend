import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent {

  @Input() label: string;
  @Input() type: 'regular' | 'header' = 'regular';
  @Input() customInputClass: string = '';
  @Input() customLabelClass: string = '';
  @Input() value: string;
  @Input() errorMessage: string;
  @Input() inputType?: string;
  @Input() error: string;

  @Output() inputChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
  }

  sendValue(event) {
    this.inputChange.emit(event.target.value);
  }

}
