import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import {IdName} from '../../models/id-name';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements AfterViewInit, OnChanges, OnDestroy, AfterViewChecked {

  @Input() tabsList: IdName[];
  @Input() activeTab: string;
  @Output() tabHasBeenSelected: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('tabContainer') tabContainer;
  @ViewChild('backArrow') backArrow;
  @ViewChild('forthArrow') forthArrow;
  @ViewChild('wrapper') wrapper;

  constructor() {
    this.activateOrDeactivateArrows = this.activateOrDeactivateArrows.bind(this);
  }

  onTabClicked(tabClicked: string) {
    this.tabHasBeenSelected.emit(tabClicked);
    this.activateOrDeactivateArrows(tabClicked);
    this.scrollTheContainer(tabClicked);
  }

  scrollTheContainer(tabClicked: string): void {
    const positionInArray = this.tabsList.map(el => {return el.id}).indexOf(tabClicked);
    const element = this.tabContainer.nativeElement.children[positionInArray];
    if (element) element.scrollIntoView();
  }

  arrowClicked(type: string) {
    const positionInArray = this.tabsList.map(el => {return el.id}).indexOf(this.activeTab);
    if (type === 'back') {
      if (positionInArray - 1 < 0) return;
      const clickedTab = this.tabsList[positionInArray -  1].id.toString();
      this.tabHasBeenSelected.emit(clickedTab);
      this.activateOrDeactivateArrows(clickedTab);
      this.scrollTheContainer(clickedTab);
    }
    if (type === 'forth') {
      if (positionInArray + 1 === this.tabsList.length ) return;
      const clickedTab = this.tabsList[positionInArray + 1].id.toString();
      this.tabHasBeenSelected.emit(clickedTab);
      this.activateOrDeactivateArrows(clickedTab);
      this.scrollTheContainer(clickedTab);
    }
  }

  activateOrDeactivateArrows(clickedTab=null) {
    if (!clickedTab) {
      clickedTab = this.activeTab;
    }
    const positionInArray = this.tabsList.map(el => {return el.id}).indexOf(clickedTab);
    const boundingFirstChild = this.tabContainer.nativeElement.children[0].getBoundingClientRect();
    const boundingLastChild = this.tabContainer.nativeElement.lastElementChild.getBoundingClientRect();
    const boundingContainer = this.tabContainer.nativeElement.getBoundingClientRect();

    if (boundingFirstChild.left === boundingContainer.left && boundingContainer.right === boundingLastChild.right) {
      this.backArrow.nativeElement.style.display = 'none';
      this.forthArrow.nativeElement.style.display = 'none';
    } else {
      if (boundingFirstChild.left < boundingContainer.left) {
        this.backArrow.nativeElement.style.display = 'inline-block';
      } else {
        this.backArrow.nativeElement.style.display = 'none';
      }

      if (boundingLastChild.right >= boundingContainer.right) {
        this.forthArrow.nativeElement.style.display = 'inline-block';
      } else {
        this.forthArrow.nativeElement.style.display = 'none';
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.activateOrDeactivateArrows()
  }

  ngOnDestroy() {
    this.tabContainer.nativeElement.removeEventListener('scroll', this.activateOrDeactivateArrows)
  }

  ngAfterViewChecked(): void {
    this.activateOrDeactivateArrows();
  }

  ngAfterViewInit(): void {
    if (!this.tabContainer) return;
    this.tabContainer.nativeElement.addEventListener('scroll', this.activateOrDeactivateArrows)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.tabContainer) return;
    this.activateOrDeactivateArrows()
  }
}
