import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as card from '../../../../../assets/js/payment.js';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss'],
  animations: fuseAnimations
})
export class ResumeComponent implements OnInit, OnDestroy {
  
  resumenFormGroup: FormGroup;  

  paymentFormGroup: FormGroup;
  paymentFormGroupErrors: any;

  card_month = '';
  card_year = '';

  cardIsCreated = false;
  paymentSuccess = false;
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {InvoiceService} _invoiceService
   */
  constructor(   
    private _fuseConfigService: FuseConfigService, 
    private _formBuilder: FormBuilder,
    private ngZone: NgZone
  ) {    
    this._fuseConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        toolbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        sidepanel: {
          hidden: true
        }
      }
    };

    this.paymentFormGroupErrors = {
      number: {},
      name: {},
      expiry: {},
      cvc: {},
      email: {}
    };

    this._unsubscribeAll = new Subject();
    
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
      this.resumenFormGroup = this._formBuilder.group({
        firstCtrl: ['']
      });

      this.paymentFormGroup = this._formBuilder.group({
        number  : ['', Validators.required],
        name    : ['', Validators.required],
        expiry  : ['', Validators.required],
        cvc     : ['', Validators.required],
        email   : ['', [Validators.required, Validators.email]]
      });    

      this.paymentFormGroup.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.onFormValuesChanged();
      });

      window.my = window.my || {};
      window.my.namespace = window.my.namespace || {};
      window.my.namespace.publicFunc = this.publicFunc.bind(this);
  }

  publicFunc(value): void {
    this.ngZone.run(() => this.privateFunc(value));
  }

  privateFunc(value): void {
    console.log(value);
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    // this._unsubscribeAll.next();
    // this._unsubscribeAll.complete();
  }

  changeFecExp(value): void {
    try {
      const data = value.split('/');
      this.card_month = data[0].trim();
      this.card_year = data[1].trim();
    } catch (error) {
      console.log(error);
    }
  }

  firstClick(): void {      
    if (!this.cardIsCreated) {
      const form = document.querySelector('#paymentFormGroup');
      card.createCard(form);
      this.cardIsCreated = true;
    }
  }


  onFormValuesChanged(): void {
    for (const field in this.paymentFormGroupErrors) {
      if (!this.paymentFormGroupErrors.hasOwnProperty(field)) {
        continue;
      }

      // Clear previous errors
      this.paymentFormGroupErrors[field] = {};

      // Get the control
      const control = this.paymentFormGroup.get(field);

      if (control && control.dirty && !control.valid) {
        this.paymentFormGroupErrors[field] = control.errors;
      }
    }
  }
}
