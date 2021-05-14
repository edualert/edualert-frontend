import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { IdName } from '../../models/id-name';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements AfterViewInit, OnDestroy, AfterViewChecked {

  @Input() tabsList: IdName[];
  @Input() activeTab: string;
  @Input() shouldScrollToActiveTab = false;
  @Input() noArrows: boolean = false;
  @Output() tabHasBeenSelected: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('tabContainer') tabContainer;
  @ViewChild('backArrow') backArrow;
  @ViewChild('forthArrow') forthArrow;
  @ViewChild('wrapper') wrapper;

  isScrolledToSelectedTab = false;

  constructor() {
    this.activateOrDeactivateArrows = this.activateOrDeactivateArrows.bind(this);
  }

  onTabClicked(tabClicked: string | number) {
    this.tabHasBeenSelected.emit(tabClicked.toString());
    this.activateOrDeactivateArrows();
    const positionInArray = this.tabsList.map(el => el.id.toString()).indexOf(tabClicked.toString());
    const clickedTab = this.tabsList[positionInArray].id.toString();

    if (this.shouldScrollToActiveTab || this.checkIfTheActiveTabIsNotFullyVisible(positionInArray)) {
      this.scrollTheContainer(clickedTab);
    }
  }

  checkIfTheActiveTabIsNotFullyVisible(positionInArray): boolean {
    const tabRect = this.tabContainer.nativeElement.children[positionInArray].getBoundingClientRect();
    const containerRect = this.tabContainer.nativeElement.getBoundingClientRect();

    const containerLeftEdge = containerRect.x;
    const tabLeftEdge = tabRect.x;
    const containerRightEdge = containerRect.x + containerRect.width;
    const tabRightEdge = tabRect.x + tabRect.width;

    return tabRightEdge > containerRightEdge || tabLeftEdge < containerLeftEdge;
  }

  scrollTheContainer(tabClicked: string | number): void {
    const positionInArray = this.tabsList.map(el => el.id.toString()).indexOf(tabClicked.toString());
    const element = this.tabContainer.nativeElement.children[positionInArray];
    if (element) {
      element.scrollIntoView({
        inline: 'center'
      });
    }
  }

  arrowClicked(type: string) {
    const positionInArray = this.tabsList.map(el => el.id).indexOf(this.activeTab);
    if (type === 'back' && positionInArray - 1 >= 0) {
      const clickedTab = this.tabsList[positionInArray - 1].id.toString();
      this.tabHasBeenSelected.emit(clickedTab);
      this.activateOrDeactivateArrows();
      this.scrollTheContainer(clickedTab);
    }
    if (type === 'forth' && positionInArray + 1 < this.tabsList.length) {
      const clickedTab = this.tabsList[positionInArray + 1].id.toString();
      this.tabHasBeenSelected.emit(clickedTab);
      this.activateOrDeactivateArrows();
      this.scrollTheContainer(clickedTab);
    }
  }

  activateOrDeactivateArrows() {
    if (this.noArrows) {
      return;
    }
    if (
      !this.tabContainer.nativeElement ||
      !this.tabContainer.nativeElement.children[0] ||
      !this.tabContainer.nativeElement.lastElementChild
    ) {
      return;
    }

    const boundingFirstChild = this.tabContainer.nativeElement.children[0].getBoundingClientRect();
    const boundingLastChild = this.tabContainer.nativeElement.children[this.tabContainer.nativeElement.children.length - 1].getBoundingClientRect();
    const boundingContainer = this.tabContainer.nativeElement.getBoundingClientRect();

    if (boundingFirstChild.left === boundingContainer.left && boundingContainer.right === boundingLastChild.right || this.tabsList.length < 3) {
      this.backArrow.nativeElement.style.display = 'none';
      this.forthArrow.nativeElement.style.display = 'none';
    } else {

      if (boundingFirstChild.left < boundingContainer.left) {
        this.backArrow.nativeElement.style.display = 'inline-block';
      } else {
        this.backArrow.nativeElement.style.display = 'none';
      }

      if (Math.floor(boundingLastChild.right) > boundingContainer.right) {
        this.forthArrow.nativeElement.style.display = 'inline-block';
      } else {
        this.forthArrow.nativeElement.style.display = 'none';
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.activateOrDeactivateArrows();
  }

  ngOnDestroy() {
    this.tabContainer.nativeElement.removeEventListener('scroll', this.activateOrDeactivateArrows);
  }

  ngAfterViewChecked(): void {
    this.activateOrDeactivateArrows();
    if (this.shouldScrollToActiveTab && this.activeTab && !this.isScrolledToSelectedTab) {
      this.isScrolledToSelectedTab = true;
      this.scrollTheContainer(this.activeTab);
    }
  }

  ngAfterViewInit(): void {
    if (!this.tabContainer) {
      return;
    }
    this.tabContainer.nativeElement.addEventListener('scroll', this.activateOrDeactivateArrows);
  }
}
