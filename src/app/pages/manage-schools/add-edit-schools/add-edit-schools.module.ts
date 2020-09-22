import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from 'src/app/core/core.module';
import { DropdownModule } from 'src/app/shared/dropdown/dropdown.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { EditSchoolDetailsComponent } from './edit-school-details/edit-school-details.component';
import {HeaderModule} from '../../../header/header.module';
import { AddSchoolDetailsComponent } from './add-school-details/add-school-details.component';
import { AddEditSchoolsComponent } from './add-edit-schools.component';
import {RouterModule} from '@angular/router';
import {AddUserModalModule} from '../../manage-users/add-user-modal/add-user-modal.module';

@NgModule({
  declarations: [EditSchoolDetailsComponent, AddSchoolDetailsComponent, AddEditSchoolsComponent],
  imports: [
    CommonModule,
    CoreModule,
    DropdownModule,
    SharedModule,
    HeaderModule,
    RouterModule,
    AddUserModalModule
  ]
})
export class AddEditModule {}
