import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModalModule} from '../../../shared/modal/modal.module';
import {SharedModule} from '../../../shared/shared.module';
import {AddUsersBulkComponent} from './add-users-bulk.component';

@NgModule({
  declarations: [AddUsersBulkComponent],
  imports: [CommonModule, ModalModule, SharedModule],
  exports: [AddUsersBulkComponent]
})
export class AddUsersBulkModule {
}
