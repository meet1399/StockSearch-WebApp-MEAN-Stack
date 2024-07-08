import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, Observable, debounceTime } from 'rxjs';

import { UtilService } from '../util.service';

export interface AutocompleteCompany {
  symbol: string;
  description: string;
}

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchbarComponent implements OnInit {
  @Output() notify = new EventEmitter();

  formCtrl = new FormControl();
  dummyCtrl = new FormControl();
  resultCompanies: Observable<any[]>;
  loading: boolean;
  autocompleteEnabled: boolean = true;
  companies: any[];

  constructor(
    private router: Router, 
    private http: HttpClient,
    private util : UtilService) {

    this.loading = false;
    this.companies = [];
    
    // fetch autocomplete result
    this.formCtrl.valueChanges.pipe(
      debounceTime(300),
    )
    .subscribe(val => {
      this.companies = [];
      this.dummyCtrl.setValue("");
      if (!val || val.length == 0) {
        this.loading = false;
        this.companies = [];
        // simulate a value change!
        this.dummyCtrl.setValue(" ");
        this.dummyCtrl.setValue("");
      } else {
        this.loading = true;
        var url = "http://localhost:3000/api/autocomplete/" + val.trim();
        this.http.get<any[]>(url)
        .subscribe(res => {
          this.companies = res;
          this.dummyCtrl.setValue(val);
          this.loading = false;
        });
      }
    });
    
    this.resultCompanies = this.dummyCtrl.valueChanges.pipe(
      map(company => this.companies.slice())
    );
    
  }

  ngOnInit(): void {
  }

  onOptionClick(value: any) {
    if (value) {
      this.util.setSearchInput(value);
      this.notify.emit();
    }
    return value;
  }

  onFormSubmit(event: Event) {
    event.preventDefault();
    this.onSearchClick();
  }

  onSearchClick() {
    this.util.setSearchInput(this.formCtrl.value);
    this.notify.emit();
  }

  onClearClick() {
    this.formCtrl.setValue("");
    this.util.setClearContentFlag(true);
    this.util.setSearchInput(""); // TODO: decide whether to keep this line
    this.util.setValidDataPresentFlag(false);
    this.util.setSearchSymbol('home');
    this.util.cardSwitchFlag = false;
    this.util.cardNavbarSwitchFlag = false;
    this.notify.emit();
    this.router.navigate(['/']);
  }

  onSubmit() {

  }

}
