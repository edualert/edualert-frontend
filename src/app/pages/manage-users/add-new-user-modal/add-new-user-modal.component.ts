import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {ModalComponent} from '../../../shared/modal/modal.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-add-new-user-modal',
  templateUrl: './add-new-user-modal.component.html',
  styleUrls: ['./add-new-user-modal.component.scss']
})
export class AddNewUserModalComponent {
  @ViewChild('modal', {static: false}) modal: ModalComponent;

  @Output() usersListUploaded: EventEmitter<File> = new EventEmitter<File>();
  @ViewChild('uploadUsersList', {static: false}) uploadUsersList: ElementRef<HTMLInputElement>;
  usersListFile: File = null;
  uploadedFileName: string = '';

  title: string = 'Adaugă un utilizator nou';
  infoText: string = 'Alegeți o metodă de adăugare utilizator(i):';
  newUserButtonText: string = 'Adăugare utilizator unic';
  importUsersButtonText: string = 'Importă listă utilizatori';
  singleUserChoice: boolean = false;
  multipleUsersChoice: boolean = false;

  constructor(private router: Router) {
  }

  open() {
    this.modal.open();
    this.usersListFile = null;
    this.uploadedFileName = '';
    this.singleUserChoice = false;
    this.multipleUsersChoice = false;
  }

  close() {
    this.modal.close();
    if (this.singleUserChoice) {
      this.router.navigate(['/manage-users/add']);
    } else if (this.multipleUsersChoice) {
      this.usersListUploaded.emit(this.usersListFile);
      this.uploadUsersList.nativeElement.value = '';
      this.usersListFile = null;
      this.uploadedFileName = '';
    }
  }

  singleUserChoiceClick() {
    this.singleUserChoice = !this.singleUserChoice;
    if (this.singleUserChoice === true) {
      this.multipleUsersChoice = false;
      this.uploadedFileName = '';
    }
  }

  multipleUsersChoiceClick() {
    this.multipleUsersChoice = !this.multipleUsersChoice;
    if (this.multipleUsersChoice === true) {
      this.uploadUsersList.nativeElement.click();
      this.singleUserChoice = false;
    } else {
      this.uploadedFileName = '';
    }
  }

  getFileData(event: any) {
    if (event.target?.files?.length > 0) {
      this.uploadedFileName = event.target.files[0].name;
      this.usersListFile = event.target.files[0];
    }
  }
}
