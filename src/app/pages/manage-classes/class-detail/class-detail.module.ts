import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../../core/core.module';
import {HeaderModule} from '../../../header/header.module';
import {ClassDetailComponent} from './class-detail.component';
import {SharedModule} from '../../../shared/shared.module';
import {ConfirmationModalModule} from '../../../shared/confirmation-modal/confirmation-modal.module';
import {ViewUserModalModule} from '../../manage-users/view-user-modal/view-user-modal.module';


@NgModule({
  declarations: [
    ClassDetailComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    HeaderModule,
    SharedModule,
    ConfirmationModalModule,
    ViewUserModalModule
  ]
})
export class ClassDetailModule {
}
