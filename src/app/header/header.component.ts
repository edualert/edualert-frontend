import {AfterViewInit, Component} from '@angular/core';
import {HeaderService} from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit {

  constructor(
    headerService: HeaderService
  ) {
    headerService.getHeaderHeight().subscribe(value => {
      const headerHeight = document.getElementById('page-header').getBoundingClientRect().height;
      (document.getElementsByClassName('header-sublayer')[0] as HTMLElement).style.height = `${headerHeight}px`;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const headerHeight = document.getElementById('page-header').getBoundingClientRect().height;
      (document.getElementsByClassName('header-sublayer')[0] as HTMLElement).style.height = `${headerHeight}px`;
    }, 200);
  }

}
