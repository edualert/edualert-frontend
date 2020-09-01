import {NgModule} from '@angular/core';
import {ToolbarComponent} from './toolbar.component';
import {CommonModule} from '@angular/common';
import {SettingsModalModule} from '../settings-modal/settings-modal.module';

@NgModule({
  declarations: [
    ToolbarComponent
  ],
  imports: [
    CommonModule,
    SettingsModalModule
  ],
  exports: [ToolbarComponent]
})
export class ToolbarModule {
}
