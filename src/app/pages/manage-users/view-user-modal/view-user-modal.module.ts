import {NgModule} from '@angular/core';
import {ModalModule} from '../../../shared/modal/modal.module';
import {ViewUserModalComponent} from './view-user-modal.component';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [ViewUserModalComponent],
  imports: [CommonModule, ModalModule, SharedModule, FormsModule],
  exports: [ViewUserModalComponent]
})
export class ViewUserModalModule {
}
