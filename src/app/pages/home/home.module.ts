import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home.component';
import {HomeStudentComponent} from './home-student/home-student.component';
import {HomeParentComponent} from './home-parent/home-parent.component';
import {CoreModule} from '../../core/core.module';
import {HomeOrsComponent} from './home-ors/home-ors.component';
import {HomePrincipalComponent} from './home-principal/home-principal.component';
import {HomeTeacherComponent} from './home-teacher/home-teacher.component';
import {HeaderModule} from '../../header/header.module';
import {SharedModule} from '../../shared/shared.module';
import {NgxChartsModule} from '@swimlane/ngx-charts';


@NgModule({
  declarations: [
    HomeComponent,
    HomeOrsComponent,
    HomePrincipalComponent,
    HomeTeacherComponent,
    HomeParentComponent,
    HomeStudentComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    HeaderModule,
    SharedModule,
    NgxChartsModule
  ],
})
export class HomeModule {
}
