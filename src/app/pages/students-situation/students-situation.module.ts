import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentsSituationComponent } from './students-situation.component';
import {CoreModule} from '../../core/core.module';
import { StudentsSituationOrsComponent } from './students-situation-ors/students-situation-ors.component';
import { StudentsSituationTeacherPrincipalComponent } from './students-situation-teacher-principal/students-situation-teacher-principal.component';
import {HeaderModule} from '../../header/header.module';
import {FilterModule} from '../../filter/filter.module';
import {FilterSearchModule} from '../../filter-search/filter-search.module';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';
import {CatalogModule} from '../../catalog/catalog.module';


@NgModule({
  declarations: [StudentsSituationComponent, StudentsSituationOrsComponent, StudentsSituationTeacherPrincipalComponent],
  imports: [
    CommonModule,
    CoreModule,
    HeaderModule,
    FilterModule,
    FilterSearchModule,
    DropdownModule,
    CatalogModule
  ]
})
export class StudentsSituationModule { }
