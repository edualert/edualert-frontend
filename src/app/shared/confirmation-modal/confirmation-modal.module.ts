import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConfirmationModalComponent} from './confirmation-modal.component';
import {ModalModule} from '../modal/modal.module';

@NgModule({
  declarations: [
    ConfirmationModalComponent,
  ],
  imports: [
    CommonModule,
    ModalModule
  ],
  exports: [
    ConfirmationModalComponent,
  ]
})
export class ConfirmationModalModule {
}
