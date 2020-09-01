import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeModule} from './pages/home/home.module';
import {LoginComponent} from './pages/login/login.component';
import {DevtoolsComponent} from './pages/devtools/devtools.component';
import {PageComponent} from './page/page.component';
import {DropdownModule} from './shared/dropdown/dropdown.module';
import {NavBarComponent} from './nav-bar/nav-bar.component';
import {ManageUsersModule} from './pages/manage-users/manage-users.module';
import {MessagesModule} from './pages/messages/messages.module';
import {ManageClassesModule} from './pages/manage-classes/manage-classes.module';
import {ClassDetailModule} from './pages/manage-classes/class-detail/class-detail.module';
import {ReportsModule} from './pages/reports/reports.module';
import {StudentsSituationModule} from './pages/students-situation/students-situation.module';
import {MyClassesModule} from './pages/my-classes/my-classes.module';
import {SharedModule} from './shared/shared.module';
import {HeaderModule} from './header/header.module';
import {ManageSchoolsModule} from './pages/manage-schools/manage-schools.module';
import {AddEditModule} from './pages/manage-schools/add-edit-schools/add-edit-schools.module';
import {FormsModule} from '@angular/forms';
import { EditStudyYearComponent } from './pages/manage-school-calendar/edit-study-year/edit-study-year.component';
import { ViewStudyYearComponent } from './pages/manage-school-calendar/view-study-year/view-study-year.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AuthInterceptorService} from './services/auth-interceptor.service';
import {TimeoutInterceptorService} from './services/timeout-interceptor.service';
import {UrlInterceptorService} from './services/url-interceptor.service';
import {ManageClassProfilesModule} from './pages/manage-class-profiles/manage-class-profiles.module';
import {MyAccountModule} from './pages/my-account/my-account.module';
import {CatalogModule} from './catalog/catalog.module';
import {NgxChartsModule} from '@swimlane/ngx-charts';

import {LanguageInterceptorService} from './services/language-interceptor.service';
import {StudentCatalogModule} from './pages/student-catalog/student-catalog.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {StudentOwnSituationModule} from './pages/school-situation/student-own-situation.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DevtoolsComponent,
    PageComponent,
    NavBarComponent,
    EditStudyYearComponent,
    ViewStudyYearComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HomeModule,
    DropdownModule,
    ManageUsersModule,
    MessagesModule,
    ReportsModule,
    StudentsSituationModule,
    SharedModule,
    HeaderModule,
    StudentsSituationModule,
    ManageSchoolsModule,
    AddEditModule,
    FormsModule,
    HttpClientModule,
    ManageClassesModule,
    ClassDetailModule,
    ManageClassProfilesModule,
    MyClassesModule,
    MyAccountModule,
    CatalogModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    StudentCatalogModule,
    StudentOwnSituationModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UrlInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TimeoutInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LanguageInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
