import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../core/core.module';
import {HeaderModule} from '../../header/header.module';
import {SharedModule} from '../../shared/shared.module';
import {FilterModule} from '../../filter/filter.module';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';
import {ManageClassProfilesComponent} from './manage-class-profiles.component';
import {ClassProfileAddEditComponent} from './class-profile-add-edit/class-profile-add-edit.component';
import {ClassProfileDetailComponent} from './class-profile-detail/class-profile-detail.component';
import {FormsModule} from '@angular/forms';

import {ConfirmationModalModule} from '../../shared/confirmation-modal/confirmation-modal.module';

@NgModule({
  declarations: [
    ManageClassProfilesComponent,
    ClassProfileDetailComponent,
    ClassProfileAddEditComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    HeaderModule,
    FilterModule,
    DropdownModule,
    SharedModule,
    ConfirmationModalModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ManageClassProfilesModule {
}
