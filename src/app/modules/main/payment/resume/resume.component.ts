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
import { RegistroUtil } from '../../../../utils/registro.util.js';
import { SecurityService } from '../../../../services/security.service.js';
import { UserModel } from '../../../../models/user.model.js';

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
  public borrower = new UserModel();

  public productImage = {
    data: 'any'
  };

  private _unsubscribeAll: Subject<any>;

  public paymentView = true;

  public defaultImage = true; 
  public total_days_price = '';
  public circular_com_price = '';

  public pago_realizado = false;
  public pago_aceptado = false;

  public rent_return_warrancy = '';
  public paym_message = '';

  public rent_total_price_wo_warranty = '';

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
    private registroUtil: RegistroUtil,
    private securityService: SecurityService,
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
              this.rent_total_price_wo_warranty = (Number(this.rental.rent_total_price) - Number(this.rental.rent_warranty)).toFixed(2);              
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
                      this.rent_return_warrancy = this.getDateReturnRentalWarrancy(this.rental.rent_range_date.rent_end);
                      const bodyUser = {
                        user_id: this.rental.rent_borrow_id,
                        catg_ids: [
                          {
                            catg_id: this.appCategoryConfig.getBorrowerCategory()
                          },
                          {
                            catg_id: this.appCategoryConfig.getLenderBorrowerCategory()
                          }
                        ]
                      };
                      this._paymentService.detailsUser(bodyUser).subscribe(
                        dataBorrower => {                          
                          if (dataBorrower.res_service === 'ok') {
                            if (dataBorrower.data_result.Items.length > 0) {
                              this.borrower = dataBorrower.data_result.Items[0];
                            } else {
                              this.paym_message = 'Prestatario - No pudimos cargar correctamente la información, ' +
                                                  'por favor contáctar con nuestra fan-page.';      
                              this.paymentView = false;
                            }
                          } else {
                            this.paym_message = 'eNo existe información del prestatario';      
                            this.paymentView = false;                  
                          }                                                    
                        }
                      );
                    } else {
                      this.paym_message = 'Producto - No pudimos cargar correctamente la información, por favor contáctar con nuestra fan-page.';     
                      this.paymentView = false;                 
                    }
                  } 
                );
              } else {                  
                this.paym_message = 'El pago ya fue realizado.';
                this.paymentView = false;
              }
            } else {              
              this.paym_message = 'Alquiler - No pudimos cargar correctamente la información, por favor contáctar con nuestra fan-page. ';
              this.paymentView = false;
            }
          }
        );   
      }
    });
  }
  getDateReturnRentalWarrancy(pdate): string {    
    const parts_start = pdate.split('/');
    const date = new Date(parts_start[2], parts_start[1] - 1, parts_start[0]);    
    date.setDate(date.getDate() + 2);    
    const dateFormat = ('00' + date.getDate()).slice(-2) + '/' + 
    ('00' + (date.getMonth() + 1)).slice(-2) + '/' + 
    date.getFullYear();
    return dateFormat;
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
    this.loading = true;
    if (this.oCulqi.token) {
      if (!this.pago_realizado) {
        const dataToken = {
          body: this.oCulqi.token,
          token_status: 'ok',
          rent_id: this.rental.rent_id
        };
        this._paymentService.postCreateTokenPayment(dataToken).subscribe(
          data => {            
            const dataCharge = {
              paym_date_reg: this.registroUtil.obtenerFechaCreacion(),
              paym_usu_reg: this.securityService.getUserLogedId(),
              type: 'rental',
              paym_id: data.data_result_db.paym_id,
              description: 'Payment for the rental: ' + this.rental.rent_id,
              charge: {
                amount: ((Number(this.rental.rent_total_price) - Number(this.rental.rent_warranty)) * 100).toString(),
                currency_code: 'PEN',
                capture: true,
                email: this.paymentFormGroup.value.email,
                antifraud_details: {
                  address: this.borrower.user_address,
                  address_city: this.borrower.user_ubigeo.ubig_dst,
                  country_code: 'PE',
                  first_name: this.borrower.user_names,
                  last_name: this.borrower.user_full_name1,
                  phone_number: this.borrower.user_num_phone
                },
                source_id: dataToken.body.id
              }
            };
            this._paymentService.postCreateChargePayment(dataCharge).subscribe(
              dataChargeRes => {
                console.log(dataChargeRes);
                if (dataChargeRes.data_result_api.object === 'error') {                  
                  this._matSnackBar.open(dataChargeRes.data_result_api.user_message, 'Aceptar', {
                    verticalPosition: 'top',
                    duration: 5000
                  });
                  this.loading = false;
                  this.oCulqi = null;
                  this.cardValidate = false;
                } else {
                  if (dataChargeRes.data_result_api.outcome.type === 'venta_exitosa') {
                    this._matSnackBar.open('El pago fue realizado con exito.', 'Aceptar', {
                      verticalPosition: 'top',
                      duration: 3000
                    });
                    this.loading = false;
                    this.pago_realizado = true;
                    this.pago_aceptado = true;
                    const bodyUpdateStatus = {
                      status_id: 2,
                      status_text: 'Pagado',
                      status_date: this.registroUtil.obtenerFechaCreacion()
                    };
                    const currentArrayStatus = this.rental.rent_status;
                    currentArrayStatus.push(bodyUpdateStatus);
                    const dataUpdateRental = {
                      rent_id: this.rental.rent_id,
                      rent_status: currentArrayStatus
                    };
                    this._paymentService.patchUpdateRentalStatus(dataUpdateRental).subscribe(
                      dataUpdateRentalStatus => {
                        console.log(dataUpdateRentalStatus);
                      }
                    );
                  } else {
                    this._matSnackBar.open('El pago fue rechazado.', 'Aceptar', {
                      verticalPosition: 'top',
                      duration: 3000
                    });
                    this.loading = false;
                  }
                }
              }
            );
          }
        );
      } else {
        this._matSnackBar.open('El pago ya fue realizado.', 'Aceptar', {
          verticalPosition: 'top',
          duration: 3000
        });
        console.log('pago_ya_realizado');
      }
    } else {      
      this._matSnackBar.open('No se pudo procesar correctamente tu tarjeta, volver a intentar.', 'Aceptar', {
        verticalPosition: 'top',
        duration: 5000
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
      this.loading = false;
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

  limpiartTokenTarjeta(): void {
    try {
      if (this.oCulqi.token) {
        this.oCulqi = null;
        this.cardValidate = false;
      }
    } catch (ex) {}
  }
}
