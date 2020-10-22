import {Component, Input, ViewChild} from '@angular/core';
import {ModalComponent} from '../../../shared/modal/modal.component';
import {ManageUsersService} from '../../../services/manage-users.service';

@Component({
  selector: 'app-add-users-bulk',
  templateUrl: './add-users-bulk.component.html',
  styleUrls: ['./add-users-bulk.component.scss']
})
export class AddUsersBulkComponent {

  @ViewChild('modal', {static: true}) modal: ModalComponent;

  @Input() responseErrors: any;
  @Input() responseHasErrors: boolean = false;
  @Input() requestInProgress: boolean;
  @Input() successMessage: string;

  constructor(private manageUsersService: ManageUsersService) {}

  open() {
    this.modal.open();
  }

  close() {
    this.modal.close();
    this.responseErrors = [];
    if (this.successMessage.substring(0, 1) !== '0') {
      this.manageUsersService.refreshUsers();
    }
  }

  formatErrors(responseErrors: any): any[] {
    const errorsArray = [];
    if (responseErrors) {
      Object?.keys(responseErrors).forEach(key => {
        const errorKeys = Object?.keys(responseErrors[key]);
        errorsArray.push({errorData: responseErrors[key], errorKeys: errorKeys, rowName: key});
      });
    }
    return errorsArray;
  }

}
