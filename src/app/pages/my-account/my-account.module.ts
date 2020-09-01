import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../core/core.module';
import {HeaderModule} from '../../header/header.module';
import {SharedModule} from '../../shared/shared.module';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';
import {ModalModule} from '../../shared/modal/modal.module';
import {ConfirmationModalModule} from '../../shared/confirmation-modal/confirmation-modal.module';
import {MyAccountComponent} from './my-account.component';
import {EditMyAccountComponent} from './edit-my-account/edit-my-account.component';


@NgModule({
  declarations: [
    MyAccountComponent,
    EditMyAccountComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    HeaderModule,
    SharedModule,
    DropdownModule,
    ModalModule,
    ConfirmationModalModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MyAccountModule {
}
