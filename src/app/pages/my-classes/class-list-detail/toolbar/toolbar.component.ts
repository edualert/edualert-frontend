import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  isOpen: boolean;
  @Input() buttonsObjList: [{text: string, buttonCallbackFn: any}];
}
