import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {ModalComponent} from '../modal/modal.component';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
  @ViewChild('modal', {static: false}) modal: ModalComponent;
  title: string;
  description: string;
  cancelButtonText: string = 'Nu';
  confirmButtonText: string = 'Da';

  // Will get its value from the callback passed as param in the open() method
  confirmButtonAction() {
  }

  // When the modal is open by its parent,
  // all its data and behavior(a.k.a functions) has to be passed via the modalData Param (That's why we don't have outputs)
  open(modalData: ModalData) {
    this.title = modalData.title;
    this.description = modalData.description;
    if (modalData.cancelButtonText) {
      this.cancelButtonText = modalData.cancelButtonText;
    }
    if (modalData.confirmButtonText) {
      this.confirmButtonText = modalData.confirmButtonText;
    }
    this.confirmButtonAction = () => {
      modalData.confirmButtonCallback();
      this.modal.close();
    };
    this.modal.open();
  }

  cancel() {
    this.modal.close();
  }
}

class ModalData {
  title: string;
  description?: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  confirmButtonCallback: (...param: any) => any; // function
}
