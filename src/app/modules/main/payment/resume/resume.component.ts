import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as card from '../../../../../assets/js/payment.js';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { PaymentService } from '../../../../services/payment.service.js';
import { ActivatedRoute } from '@angular/router';
import { RentalModel } from '../../../../models/rental.model.js';
import { S3Service } from '../../../../services/s3.service';
import { AppCategoryConfig } from '../../../../app-config/app-categorys.config';
import * as base64Converter from 'base64-arraybuffer';
import { Product } from '../../../../models/product.model';

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

  public rental = new RentalModel();
  public product = new Product();
  public productImage = {
    data: 'any'
  };

  private _unsubscribeAll: Subject<any>;

  public paymentView = true;

  public defaultImage = true; 
  public total_days_price = '';
  public circular_com_price = '';

  public pago_realizado = false;

  step = 0;

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
    private _activateRoute: ActivatedRoute,
    private _s3Service: S3Service,
    private appCategoryConfig: AppCategoryConfig,
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
              if (last_status_id === 1 ){                
                // this.paymentView = false;
                const body = {
                    prod_id : this.rental.rent_prod_id
                };
                this._paymentService.detailsProduct(body).subscribe(
                  dataProduct => {                                    
                    if (dataProduct.res_service === 'ok' && dataProduct.data_result.Item != null) {
                      this.product = dataProduct.data_result.Item;
                      this.cargarImagesS3Product(this.product.prod_url_documen);
                      this.total_days_price = (Number(this.rental.rent_days) * Number(this.rental.rent_days_price)).toFixed(2);
                      this.circular_com_price = (Number(this.total_days_price) * (Number(this.rental.rent_commission / 100))).toFixed(2);
                    } else {
                      console.log('el producto no esta disponible o no existe');
                      // this.paymentView = true;
                    }
                  } 
                );
              } else {  
                console.log('ya fue pagado');
                // this.paymentView = true;
              }
            } else {
              console.log('no_existe_rental');
              // this.paymentView = true;
            }
          }
        );   
      }
    });
  }

  cargarImagesS3Product(documents): void {  
    if (documents) {
            if (documents.length > 0) {
              const datas3Body = {
                  app_key: documents[0].image_key,
                  app_catg_id: this.appCategoryConfig.getProductCategory()
              };
              this._s3Service.getImageS3(datas3Body).subscribe(
                  data => {
                      if (data.res_service === 'ok') {
                          const image = {
                              data: base64Converter.encode(data.data_result.Body.data),
                              desc: documents[0]
                          };
                          this.productImage = image;         
                          this.defaultImage = false;               
                      }
                  }
              );
            }
    }
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

      if (!this.pago_realizado) {
        const dataToken = {
          body: this.oCulqi.token,
          token_status: 'ok'
        };
        console.log(dataToken);
        this._paymentService.postCreateTokenPayment(dataToken).subscribe(
          data => {
            this.pago_realizado = true;
            console.log(data);
          }
        );
      } else {
        console.log('pago_ya_realizado');
      }

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

  setStep(index: number): void {
    this.step = index;
  }

  nextStep(): void {
    this.step++;
  }

  prevStep(): void {
    this.step--;
  }  

}
