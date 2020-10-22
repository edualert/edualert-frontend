import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';
import {StudentOwnSituationComponent} from './student-own-situation.component';
import {HeaderModule} from '../../header/header.module';
import {CatalogModule} from '../../catalog/catalog.module';
import {FilterModule} from '../../filter/filter.module';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';
import {SettingsModalModule} from '../../catalog/settings-modal/settings-modal.module';
import {ViewUserModalModule} from '../manage-users/view-user-modal/view-user-modal.module';

@NgModule({
  declarations: [StudentOwnSituationComponent],
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    HeaderModule,
    CatalogModule,
    FilterModule,
    DropdownModule,
    ViewUserModalModule
  ],
  exports: [StudentOwnSituationComponent],
})
export class StudentOwnSituationModule { }
