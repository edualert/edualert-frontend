import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  isOpen: boolean;
  @Input() buttonsObjList: [{text: string, buttonCallbackFn: any, disabled?: boolean}];
  @Input() tags: any;
  @Input() tagsSection: boolean = false;
  @Input() hasCount: boolean = true;
  @Input() countedElements: number;

  constructor() {
    this.isOpen = false;
  }

  toggleIsOpen(event) {
    event.preventDefault();
    this.isOpen = !this.isOpen;
  }
}
