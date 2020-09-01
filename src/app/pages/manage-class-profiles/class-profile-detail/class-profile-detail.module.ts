import {NgModule} from '@angular/core';
import {ModalModule} from '../../../shared/modal/modal.module';
import {ConfirmationModalModule} from '../../../shared/confirmation-modal/confirmation-modal.module';
import {ClassProfileDetailComponent} from './class-profile-detail.component';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../../core/core.module';
import {HeaderModule} from '../../../header/header.module';
import {SharedModule} from '../../../shared/shared.module';

@NgModule({
  declarations: [
    ClassProfileDetailComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    HeaderModule,
    ModalModule,
    ConfirmationModalModule,
    SharedModule,
  ]
})
export class ClassProfileDetailModule {
}
