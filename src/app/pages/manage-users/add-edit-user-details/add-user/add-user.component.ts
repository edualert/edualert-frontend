import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {UserDetails} from '../../../../models/user-details';
import {HttpClient} from '@angular/common/http';
import {get} from 'lodash'
import {Router} from '@angular/router';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  errors: any = {};
  userDetails: UserDetails = new UserDetails({is_active: true, use_phone_as_username: false});
  hasModifiedData: boolean = false;
  hasUnfilledFields: boolean = false;
  hasUnsavedData: boolean = true;

  @ViewChild('saveButton') saveButton: ElementRef;

  submitData(userDetails) {
    if (userDetails !== null) {
      let requestBody = {...userDetails};
      requestBody.labels = requestBody.labels.map(el => el.id);
      requestBody.parents = requestBody.parents.map(el => el.id);
      requestBody.taught_subjects = requestBody.taught_subjects.map(el => el.id);
      this.httpClient.post('users/', requestBody).subscribe((response) => {
        this.hasUnsavedData = false;
        this.router.navigate(['manage-users']);
      },(error) => {
        this.errors = error['error']
      });
    }
  }

  @HostListener('window:beforeunload')
  refreshGuard($event) {
    if (this.hasModifiedData) {
      $event.returnValue = '';
    }
  }

  hasModifiedDataEvent(hasModifiedData) {
    this.hasModifiedData = hasModifiedData
  }

  constructor(private httpClient: HttpClient, private router: Router) {}

  ngOnInit(): void {}

}
