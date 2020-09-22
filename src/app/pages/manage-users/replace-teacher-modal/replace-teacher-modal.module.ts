import {NgModule} from '@angular/core';
import {ReplaceTeacherModalComponent} from './replace-teacher-modal.component';
import {ModalModule} from '../../../shared/modal/modal.module';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [
    ReplaceTeacherModalComponent,
  ],
  imports: [
    CommonModule,
    ModalModule,
  ],
  exports: [
    ReplaceTeacherModalComponent
  ]
})
export class ReplaceTeacherModalModule {}
