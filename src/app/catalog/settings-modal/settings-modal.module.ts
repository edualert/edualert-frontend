import {NgModule} from '@angular/core';
import {SettingsModalComponent} from './settings-modal.component';
import {CommonModule} from '@angular/common';
import {ModalModule} from '../../shared/modal/modal.module';

@NgModule({
  declarations: [
    SettingsModalComponent
  ],
  imports: [
    CommonModule,
    ModalModule
  ],
  exports: [
    SettingsModalComponent
  ]
})
export class SettingsModalModule {
}
