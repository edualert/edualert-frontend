import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddNewUserModalComponent} from './add-new-user-modal.component';
import {ModalModule} from '../../../shared/modal/modal.module';

@NgModule({
  declarations: [
    AddNewUserModalComponent,
  ],
  imports: [
    CommonModule,
    ModalModule
  ],
  exports: [
    AddNewUserModalComponent,
  ]
})
export class AddNewUserModalModule {
}
