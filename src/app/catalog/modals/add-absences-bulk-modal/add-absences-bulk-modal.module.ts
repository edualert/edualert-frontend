import {NgModule} from '@angular/core';
import {ModalModule} from '../../../shared/modal/modal.module';
import {AddAbsencesBulkModalComponent} from './add-absences-bulk-modal.component';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from '../../../shared/dropdown/dropdown.module';

@NgModule({
  declarations: [AddAbsencesBulkModalComponent],
  imports: [CommonModule, ModalModule, SharedModule, FormsModule, DropdownModule],
  exports: [AddAbsencesBulkModalComponent]
})
export class AddAbsencesBulkModalModule {
}
