import {NgModule} from '@angular/core';
import {ModalModule} from '../../../shared/modal/modal.module';
import {AddGradesBulkModalComponent} from './add-grades-bulk-modal.component';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from '../../../shared/dropdown/dropdown.module';

@NgModule({
  declarations: [AddGradesBulkModalComponent],
  imports: [CommonModule, ModalModule, SharedModule, FormsModule, DropdownModule],
  exports: [AddGradesBulkModalComponent]
})
export class AddGradesBulkModalModule {
}
