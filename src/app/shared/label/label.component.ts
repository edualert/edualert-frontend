import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})
export class LabelComponent {

  @Input() label: string;
  @Input() value: string;
  @Input() type: string;
  @Input() customInputClass: string;
  @Input() customLabelClass: string;
  @Input() extraData?: string;

  constructor() {
  }

}
