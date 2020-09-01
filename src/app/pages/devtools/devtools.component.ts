import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-devtools',
  templateUrl: './devtools.component.html',
  styleUrls: ['./devtools.component.scss']
})
export class DevtoolsComponent implements OnInit {
  radioButtonChecked = true;

  dropdownList = ['Marcelicaș', 'DorinaĂ', 'Florinelaî', 'EusebiuÎ', 'TeofilȘ', 'Iustinianș', 'SoprosinaȚ', 'Ionicaț', 'AlbertaÂ', 'Cripolanaâ', 'Ferdinandela'];
  dropdownElement = null;
  dropdownAppliedSelection = null;

  view: any[] = [1500, 300];
  xAxis: boolean = true;
  yAxis: boolean = true;
  multi: any[] = [
    {
      'name': 'Instituții',
      'series': [
        {
          'name': '10',
          'value': 62
        },
        {
          'name': '11',
          'value': 70
        },
        {
          'name': 'M 12',
          'value': 50
        },
        {
          'name': 'M 13',
          'value': 60
        },
        {
          'name': 'J 14',
          'value': 65
        },
        {
          'name': '15',
          'value': 68
        },
        {
          'name': '16',
          'value': 89
        }
      ]
    }
  ];


  constructor() {
    Object.assign(this, {multi: this.multi});
  }

  ngOnInit(): void {
  }

  dropdownElementClicked(element: { element, index }) {
    this.dropdownElement = this.dropdownList[element.index];
  }

  dropdownSelectionConfirmed(selection: { element, index }[]) {
    this.dropdownAppliedSelection = selection.map(element => element.element);
  }
}
