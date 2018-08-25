import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as card from '../../../../../assets/js/payment.js';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { PaymentService } from '../../../../services/payment.service.js';
import { RentalService } from '../../../../services/rental.service.js';
import { ActivatedRoute } from '@angular/router';
import { RentalModel } from '../../../../models/rental.model.js';

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
  cardValidate = false;

  public loading = false;

  oCulqi: any;

  public rental: any;

  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {InvoiceService} _invoiceService
   */
  constructor(   
    private _fuseConfigService: FuseConfigService, 
    private _formBuilder: FormBuilder,
    private ngZone: NgZone,
    private _matSnackBar: MatSnackBar,        
    private _paymentService: PaymentService,    
    private _activateRoute: ActivatedRoute
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

      (<any>window).my = (<any>window).my || {};
      (<any>window).my.namespace = (<any>window).my.namespace || {};
      (<any>window).my.namespace.validateCard = this.validateCard.bind(this);

      this.cargarInfoRental();

  }
  
  cargarInfoRental(): void {
    this._activateRoute.params.subscribe(params => {
      if (params.rent_id) {
        const bodyRental = {
          rent_id: params.rent_id
        };
        this._paymentService.detailsRental(bodyRental).subscribe(
          data => {            
            if (data.res_service === 'ok' && data.data_result.Item != null) {
              this.rental = new RentalModel(data.data_result.Item);
              console.log(this.rental);
              let last_status_id = 1;
              if (this.rental.rent_status.length > 0) {
                this.rental.rent_status.forEach(element => {
                  if (element.status_id > last_status_id) {
                    last_status_id = element.status_id;
                  } else {
                    last_status_id = element.status_id;
                  }
                });
              }
            } else {
              console.log('no_existe_rental');
            }
          }
        );        
      }
    });
  }

  validateCard(value): void {
    this.ngZone.run(() => this.fValidateCard(value));
  }

  fValidateCard(Culqi): any {
    this.loading = true;
    Culqi.createToken();
    this.oCulqi = Culqi;
    setTimeout(() => {
      this.cardValidate = true;
      this.loading = false;
    }, 10000);
  }
  
  createPayment(): void {    
    if (this.oCulqi.token) {
      const dataToken = {
        body: this.oCulqi.token,
        token_status: 'ok'
      };
      console.log(dataToken);      
      this._paymentService.postCreateTokenPayment(dataToken).subscribe(
        data => {
          console.log(data);
        }
      );
      // ,
      // "metadata": {
      //   "M": {
      //     "dni": {
      //       "S": response.metadata.dni
      //     }
      //   }
      // }
      // Guardar el token en la BD
    } else {      
      this._matSnackBar.open('No se pudo procesar correctamente tu tarjeta, volver a intentar.', 'Aceptar', {
        verticalPosition: 'top',
        duration: 3000
      });
      const dataToken = {
        body: this.oCulqi.error,
        token_status: 'error'
      };      
      this._paymentService.postCreateTokenPayment(dataToken).subscribe(
        data => {
          console.log(data);
        }
      );      
      this.cardValidate = false;
      this.paymentFormGroup.controls.number.patchValue('');
      this.paymentFormGroup.controls.cvc.patchValue('');
      this.paymentFormGroup.controls.expiry.patchValue('');
      this.paymentFormGroup.controls.name.patchValue('');
    }
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
