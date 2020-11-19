import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../core/core.module';
import {StudentCatalogComponent} from './student-catalog.component';
import {HeaderModule} from '../../header/header.module';
import {CatalogModule} from '../../catalog/catalog.module';
import {RouterModule} from '@angular/router';
import {ViewUserModalModule} from '../manage-users/view-user-modal/view-user-modal.module';

@NgModule({
  declarations: [
    StudentCatalogComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    HeaderModule,
    CatalogModule,
    RouterModule,
    ViewUserModalModule
  ],
  exports: [
    StudentCatalogComponent
  ]
})
export class StudentCatalogModule { }
