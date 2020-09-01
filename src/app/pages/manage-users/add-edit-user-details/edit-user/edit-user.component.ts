import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {UserDetails} from '../../../../models/user-details';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {get} from 'lodash';
import {AccountService} from '../../../../services/account.service';
import {findIndex} from 'lodash';


@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {

  account: UserDetails;
  userDetails: UserDetails;
  errors: any = {};
  userDetailsId: string;
  availableFields: any;
  hasModifiedData: boolean = false;
  hasUnfilledFields: boolean = false;
  hasUnsavedData: boolean = true;

  private readonly path = 'users/';

  @ViewChild('saveButton') saveButton: ElementRef;

  constructor(
    accountService: AccountService,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
  ) {
    accountService.account.subscribe((account: UserDetails) => {
      this.account = account;
    });
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

  submitData(userDetails) {
    if (userDetails !== null) {
      let requestBody = {...userDetails};
      requestBody.labels = requestBody.labels ? requestBody.labels.map(el => el.id) : requestBody.labels;
      requestBody.parents = requestBody.parents ? requestBody.parents.map(el => el.id) : requestBody.parents;
      requestBody.taught_subjects = requestBody.taught_subjects ? requestBody.taught_subjects.map(el => el.id) : requestBody.taught_subjects;
      this.httpClient.put('users/' + this.userDetails.id + '/', requestBody).subscribe((response) => {
        this.hasUnsavedData = false;
        this.router.navigate(['manage-users']);
      }, (error) => {
        this.errors = error['error'];
      });
    }
  }

  getUserDetails() {
    this.activatedRoute.params.subscribe(params => {
      this.userDetailsId = get(params, 'userId', null);
      this.httpClient.get<UserDetails>(this.path + this.userDetailsId + '/').subscribe(response => {
        this.userDetails = response;
      });
    });
  }

  ngOnInit(): void {
    this.getUserDetails();
  }

}
