import {NgModule} from '@angular/core';
import {ModalModule} from '../../../shared/modal/modal.module';
import {AddUserModalComponent} from './add-user-modal.component';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [AddUserModalComponent],
  imports: [CommonModule, ModalModule, SharedModule, FormsModule],
  exports: [AddUserModalComponent]
})
export class AddUserModalModule {
}
