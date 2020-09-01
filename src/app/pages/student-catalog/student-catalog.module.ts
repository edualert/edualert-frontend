import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../core/core.module';
import {StudentCatalogComponent} from './student-catalog.component';
import {HeaderModule} from '../../header/header.module';
import {CatalogModule} from '../../catalog/catalog.module';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    StudentCatalogComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    HeaderModule,
    CatalogModule,
    RouterModule
  ],
  exports: [
    StudentCatalogComponent
  ]
})
export class StudentCatalogModule { }
