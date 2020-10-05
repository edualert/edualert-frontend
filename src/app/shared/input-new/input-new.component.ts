import {Component, EventEmitter, Input, Output} from '@angular/core';

type CustomErrorClass = string; // will have to be defined with specific strings

// TODO rename this component after the old input will be removed
@Component({
  selector: 'app-input-new',
  templateUrl: './input-new.component.html',
  styleUrls: ['./input-new.component.scss']
})
export class InputNewComponent {
  @Input() value: string;
  @Input() error?: string;
  @Input() inputType?: string;
  @Input() customErrorClass?: CustomErrorClass[];
  @Input() maxLength?: string | number;
  @Input() inputStyle?: 'big';
  @Input() isDisabled?: boolean = false;

  @Output() inputChange: EventEmitter<string> = new EventEmitter<string>();

  sendValue(event) {
    this.inputChange.emit(event.target.value);
  }
}
