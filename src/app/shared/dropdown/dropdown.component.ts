import {Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnDestroy, OnChanges, SimpleChanges, HostListener} from '@angular/core';
import {nodeIsDescendant} from '../node-is-descendant';
import {userRoles} from '../../models/user-roles';
import {AddUserModalComponent} from '../../pages/manage-users/add-user-modal/add-user-modal.component';
import {UserDetailsBase} from '../../models/user-details-base';
import {SchoolCategory} from '../../models/school-details';
import {findIndex} from 'lodash';

export const dropdownValidations = {
  'category_level': (selection: { element: SchoolCategory, index: number }[], initialList) => {
    dropdownValidations['error'].message = '';
    dropdownValidations['error'].index = '';
    if (selection.length === 1) {
      return;
    }
    const formattedSelection = selection.map(category => category.element);
    formattedSelection.forEach((category: any, index: number) => {
      const tempList = formattedSelection;
      tempList.splice(index, 1);
      const hasDuplicate = findIndex(tempList, {category_level: category.category_level});
      if (hasDuplicate !== -1) {
        dropdownValidations['error'].message = 'Nu puteți selecta mai multe opțiuni din aceeași categorie.';
        dropdownValidations['error'].index = findIndex(initialList, {id: tempList[hasDuplicate].id});
      }
    });
  },
  'error': {message: '', index: null}
};

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss', './multiple-selection.scss']
})
export class DropdownComponent implements OnDestroy, OnChanges {
  @Input() list: any[];
  @Input() identifierProperty?: string; // Required if list is not array of strings
  @Input() displayedProperty?: string; // Required if list is not array of strings

  @Input() componentDisabled?: boolean = false; // Required if you want to disable the dropdown
  @Input() errorMessage: string = '';
  @Input() required?: boolean = false;

  // SINGLE-CHOICE.
  @Input() appliedElement: any; // Must be of the same type as the elements in the list
  @Input() withSearch?: boolean = false;
  @Input() withAddUserButton?: boolean = false;
  @Input() userRoleToAdd?: string;
  @Input() taughtSubjectId?: number = null;
  @Output() addUserModalCallbackFunction: EventEmitter<UserDetailsBase> = new EventEmitter();
  @Output() elementHasBeenSelected: EventEmitter<{ element, index }> = new EventEmitter();
  @Input() addNewUser: string;
  @Output() openNewUserModal: EventEmitter<any> = new EventEmitter();
  // END SINGLE-CHOICE

  // MULTI-CHOICE
  @Input() withMultipleSelection?: boolean = false;
  @Input() showCurrentSelection?: boolean = false;
  @Input() appliedSelection?: any[];
  @Input() validationKey?: string;
  @Output() selectionHasBeenConfirmed?: EventEmitter<{ element, index }[]> = new EventEmitter();
  // END MULTI-CHOICE

  // STYLES
  @Input() dropdownStyle?: 'big';
  @Input() placeholder?: string;
  @Input() error: string;
  @Input() isDisabled?: boolean = false;

  @ViewChild('root') root: ElementRef;
  @ViewChild('listContainer') listContainer: ElementRef;
  @ViewChild('search') search: ElementRef;
  @ViewChild('appAddUserModal', {'static': false}) appAddUserModal: AddUserModalComponent;

  isOpen: boolean;

  indexSelection: number[] = []; // array of indexes;
  viewIndexSelection: boolean[] = []; // array of @Input() list's length, with true/false for selected/unselected elements (used only in view)
  currentFullSelection: any[] = []; // array of selected full objects
  dropdownErrors: { message: string, index: number } = null;  // Object which contains the error if the dropdown is multiple choice

  searchString: string = '';
  displayedList: any[]; // used for searching (is equal to full list if not withSearch)

  highlightIndex: number = -1; // used for navigating with arrows

  readonly userRoles = userRoles;

  constructor(private elementRef: ElementRef) {
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyboard = this.handleKeyboard.bind(this);
    this.confirmAddingUser = this.confirmAddingUser.bind(this);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.list) {
      this.searchString = '';
      this.displayedList = changes.list.currentValue;
    }
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick($event) {
    if (!this.elementRef.nativeElement.contains($event.target)) {
      this.close();
    }
  }

  open() {
    if (this.isOpen === true) {
      return;
    }

    if (this.withMultipleSelection) {
      this.initialiseInternalMultipleSelections();
    }
    this.isOpen = true;
    this.displayedList = this.list;
    this.highlightIndex = -1;
    window.addEventListener('click', this.handleClick);
    window.addEventListener('keydown', this.handleKeyboard);
  }

  close() {
    if (this.search && this.search.nativeElement) {
      this.search.nativeElement.blur();
    }
    this.isOpen = false;
    this.searchString = '';
    window.removeEventListener('click', this.handleClick);
    window.removeEventListener('keydown', this.handleKeyboard);
  }

  ngOnDestroy() {
    window.removeEventListener('click', this.handleClick);
    window.removeEventListener('keydown', this.handleKeyboard);
  }

  handleKeyboard(e) {

    if (e.key === 'ArrowUp' || e.code === 'ArrowUp' || e.keyCode === 38 || e.which === 38) {
      if (this.highlightIndex > 0) {
        this.highlightIndex--;
      } else {
        this.highlightIndex = this.displayedList.length - 1;
      }
    }

    if (e.key === 'ArrowDown' || e.code === 'ArrowDown' || e.keyCode === 40 || e.which === 40) {
      if (this.highlightIndex < this.displayedList.length - 1) {
        this.highlightIndex++;
      } else {
        this.highlightIndex = 0;
      }
    }

    // scroll to highlighted element
    if (e.key === 'ArrowUp' || e.code === 'ArrowUp' || e.keyCode === 38 || e.which === 38 ||
      e.key === 'ArrowDown' || e.code === 'ArrowDown' || e.keyCode === 40 || e.which === 40) {
      // Prevent page scroll
      e.preventDefault();
      const container = this.listContainer.nativeElement;
      const element = this.listContainer.nativeElement.getElementsByClassName('element')[this.highlightIndex];
      if (!container || !element) {
        return;
      }
      if (element.offsetTop < container.scrollTop || element.offsetTop + element.offsetHeight * 2 > container.scrollTop + container.offsetHeight) {
        container.scrollTo(null, element.offsetTop);
      }
    }

    if (e.key === 'Escape' || e.code === 'Escape' || e.keyCode === 27 || e.which === 27) {
      this.close();
    }

    if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13 || e.which === 13) {
      if (this.highlightIndex < 0) {
        this.singleElementSelected(e, this.displayedList[0], 0);
      } else {
        this.singleElementSelected(e, this.displayedList[this.highlightIndex]);
      }
    }
  }

  private initialiseInternalMultipleSelections() {
    this.indexSelection = [];
    this.viewIndexSelection = [];
    this.currentFullSelection = [];

    if (!this.appliedSelection) {
      return;
    }

    let newIndexSelection;
    if (typeof this.list[0] !== 'object') {
      newIndexSelection = this.appliedSelection.map((element: string) => {
        return this.list.indexOf(element);
      });
      this.buildIndexSelections(newIndexSelection);
    } else {
      newIndexSelection = this.appliedSelection.map((element: string) => {
        return this.list.map(listElem => listElem[this.displayedProperty]).indexOf(element[this.displayedProperty]);
      });
      this.buildIndexSelections(newIndexSelection);
    }
  }

  handleClick() {
    if (!nodeIsDescendant(this.root.nativeElement, event)) {
      this.close();
    }
  }

  singleElementSelected(event: any, element: any, index?: number) {
    event.stopPropagation();

    if (element === null && index === null) {
      this.elementHasBeenSelected.emit(null);
    } else {
      this.elementHasBeenSelected.emit({element, index});
    }
    this.close();
    event.stopPropagation();
  }

  elementFromSelectionClicked(index) {
    this.dropdownErrors = null;
    this.modifyIndexSelection(index);
  }

  private modifyIndexSelection(newNumber: number) {
    const newIndexSelection = this.indexSelection.slice();
    const foundIndex = newIndexSelection.indexOf(newNumber);
    if (foundIndex < 0) {
      newIndexSelection.push(newNumber);
    } else {
      newIndexSelection.splice(foundIndex, 1);
    }
    this.buildIndexSelections(newIndexSelection);
  }

  private buildIndexSelections(newIndexSelection) {
    this.indexSelection = newIndexSelection;
    this.viewIndexSelection = this.list.map((element, index) => {
      return newIndexSelection.indexOf(index) >= 0;
    });
    this.currentFullSelection = this.indexSelection.map((element) => {
      return {element: this.list[element], index: element};
    });
  }

  confirmSelection() {
    if (this.validationKey) {
      dropdownValidations[this.validationKey](this.currentFullSelection, this.list);
      if (dropdownValidations['error'].index) {
        this.dropdownErrors = dropdownValidations['error'];
      } else {
        this.dropdownErrors = null;
        this.selectionHasBeenConfirmed.emit(this.currentFullSelection);
        this.close();
      }
    } else {
      this.selectionHasBeenConfirmed.emit(this.currentFullSelection);
      this.close();
    }
  }

  searchChange(value: string) {
    this.searchString = value;
    this.highlightIndex = -1;
    this.filterList(value);
  }


  filterList(search: string) {
    this.displayedList = this.list.map((element, index) => {
      return element;
    }).filter(element => {
      const label = element[this.displayedProperty] || element;
      const elementString = replaceLowerCaseDiacritics(label.toLowerCase());
      const searchString = replaceLowerCaseDiacritics(search.toLowerCase());
      return elementString.includes(searchString);
    });
  }

  openAddUserModal(modalData) {
    this.appAddUserModal.open(modalData);
  }

  confirmAddingUser(response: UserDetailsBase) {
    this.addUserModalCallbackFunction.emit(response);
    this.appAddUserModal.cancel();
  }
}

const diacriticsMap = {
  'ă': 'a',
  'â': 'a',
  'î': 'i',
  'ș': 's',
  'ț': 't',
};

function replaceLowerCaseDiacritics(value: string) {
  for (let [diacritic, character] of Object.entries(diacriticsMap)) {
    value = value.replace(new RegExp(diacritic, 'g'), character);
  }

  return value;
}

interface FilteredElement {
  value: any;
  originalIndex: number;
}
