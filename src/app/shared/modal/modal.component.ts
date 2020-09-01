import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import OpenCloseable from '../open-closeable';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})

// For header, body, footer to be displayed, the caller of the component needs to inject the ng-contents.
// No to be used in *ngFors unless you really know what you are doing
// Modal can to be opened by parent calling the open() on the modal, using ViewChild.
export class ModalComponent extends OpenCloseable implements AfterViewInit, OnDestroy {
  @Input() headerColor?: 'dark' | 'blue' | 'red' | 'yellow' | 'border-bottom' = 'dark';
  @ViewChild('headerContainer', {static: false}) headerContainer: ElementRef<HTMLElement>;
  @ViewChild('root', {static: false}) root: ElementRef<HTMLElement>;
  @ViewChild('bodyContainer', {static: false}) bodyContainer: ElementRef<HTMLElement>;
  @ViewChild('footerContainer', {static: false}) footerContainer: ElementRef<HTMLElement>;
  hasHeader: boolean;
  hasBody: boolean;
  hasFooter: boolean;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }


  ngAfterViewInit(): void { // if any DOM node has been injected inside the ng-content, display their respective containers
    this.hasHeader = this.headerContainer.nativeElement?.children.length > 0;
    this.hasBody = this.bodyContainer.nativeElement?.children.length > 0;
    this.hasFooter = this.footerContainer.nativeElement?.children.length > 0;

    this.cdr.detectChanges();
  }
}
