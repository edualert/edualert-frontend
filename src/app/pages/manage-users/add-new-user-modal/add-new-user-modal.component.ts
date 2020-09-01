import {Component, ViewChild} from '@angular/core';
import {ModalComponent} from '../../../shared/modal/modal.component';
import {Router} from "@angular/router";

@Component({
  selector: 'app-add-new-user-modal',
  templateUrl: './add-new-user-modal.component.html',
  styleUrls: ['./add-new-user-modal.component.scss']
})
export class AddNewUserModalComponent {
  @ViewChild('modal', {static: false}) modal: ModalComponent;
  title: string = 'Adaugă un utilizator nou';
  infoText: string = 'Alegeți o metodă de adăugare utilizator(i):';
  newUserButtonText: string = 'Adăugare utilizator unic';
  importUsersButtonText: string = 'Import listă utilizatori';
  singleUserChoice: boolean = false;
  multipleUsersChoice: boolean = false;

  constructor(private router: Router) {}

  open() {
    this.modal.open();
  }

  close() {
    this.modal.close();
    if (this.singleUserChoice) {
      this.router.navigate(['/manage-users/add']);
    }
  }

  singleUserChoiceClick() {
    this.singleUserChoice = !this.singleUserChoice;
    if (this.singleUserChoice === true) { this.multipleUsersChoice = false; }
  }

  multipleUsersChoiceClick() {
    this.multipleUsersChoice = !this.multipleUsersChoice;
    if (this.multipleUsersChoice === true) { this.singleUserChoice = false; }
  }
}
