import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FilterSearchComponent} from './filter-search.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    FilterSearchComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    FilterSearchComponent
  ]
})
export class FilterSearchModule {
}
