import {ElementRef, OnDestroy, ViewChild} from '@angular/core';

export default class OpenCloseable implements OnDestroy {
  isOpen: boolean;
  @ViewChild('root', {static: false}) root: ElementRef<HTMLElement>;

  constructor() {
    this.handleClick = this.handleClick.bind(this);
  }

  private handleClick(event: Event) {
    if (!this.root.nativeElement.contains(event.target as HTMLElement)) {
      this.close();
    }
  }

  public open() {
    if (!this.isOpen) {
      this.isOpen = true;
      window.requestAnimationFrame(() => {
        window.addEventListener('click', this.handleClick);
      });
    }
  }

  public close() {
    this.isOpen = false;
    window.removeEventListener('click', this.handleClick);
  }

  public toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('click', this.handleClick);
  }

}
