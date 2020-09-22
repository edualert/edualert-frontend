import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown.component';
import { FormsModule } from '@angular/forms';
import {AddUserModalModule} from '../../pages/manage-users/add-user-modal/add-user-modal.module';



@NgModule({
  declarations: [
    DropdownComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    AddUserModalModule
  ],
  exports: [
    DropdownComponent,
  ]
})
export class DropdownModule { }
