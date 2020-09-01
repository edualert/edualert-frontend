import {NgModule} from '@angular/core';
import {ReportsTableComponent} from './reports-table.component';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [ReportsTableComponent],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    ReportsTableComponent
  ]
})
export class ReportsTableModule {
}
