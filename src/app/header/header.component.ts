import {AfterViewInit, Component, HostListener} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit {

  constructor() { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const headerHeight = document.getElementById('page-header').getBoundingClientRect().height;
      (document.getElementsByClassName('header-sublayer')[0] as HTMLElement).style.height = `${headerHeight}px`;
    }, 200);
  }

}
