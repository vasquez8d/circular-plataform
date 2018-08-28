import { Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar} from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { Product } from '../../../../models/product.model';
import { SecurityService } from '../../../../services/security.service';
import { RegistroUtil } from '../../../../utils/registro.util';
import { Router, ActivatedRoute } from '../../../../../../node_modules/@angular/router';
import { UserService } from '../../../../services/user.service';
import { UserModel } from '../../../../models/user.model';
import { RentalModel } from '../../../../models/rental.model';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { RentalService } from '../../../../services/rental.service';
import { EcommerceProductService } from '../../../../services/product.service';
import { AppCategoryConfig } from '../../../../app-config/app-categorys.config';
import { ServicesConfig } from '../../../../app-config/services.config';

export const MY_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY'
    }
};

@Component({
    selector     : 'e-commerce-rental',
    templateUrl  : './rental.component.html',
    styleUrls    : ['./rental.component.scss'],   
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }], 
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class RentalComponent implements OnInit, OnDestroy
{
    rental: RentalModel;
    pageType: string;
    rentalForm: FormGroup;

    // Date Range Picker

    // Buscador Prestatarios    
    borrowerInformation = false;
    public borrower = new UserModel();
    public readonlyBorrower = false;

    // Buscador Articulos
    prodInformation = false;
    public product = new Product();
    public readonlyProduct  = false;

    // Status de producto
    public checkedStatusProduct = false;
    public rent_current_status = '';

    // Estado de conversacion
    public prd_est_conversva = '';

    // Status rental
    public listCurrentStatus = [];
    public listEstatusRental = [
        {
            value: 1,
            text: 'Registrado'
        },
        {
            value: 2,
            text: 'Pagado'
        },
        {
            value: 3,
            text: 'Entregado'
        },
        {
            value: 4,
            text: 'Devuelto'
        },
    ];

    public listRangoTiempos = [];
    
    public viewTotalPrice = false;
    public rental_total_price = '';
    public rentalPricerReadonly = false;
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {RentalService} _rentalService
     * @param {FormBuilder} _formBuilder
     * @param {Location} _location
     * @param {MatSnackBar} _matSnackBar
     */
    constructor(
        private _rentalService: RentalService,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private registroUtil: RegistroUtil,
        private securityService: SecurityService,
        private router: Router,
        private _userService: UserService,        
        private _activatedRoute: ActivatedRoute,
        private _productService: EcommerceProductService,
        private _appCategConfig: AppCategoryConfig ,
        private _servicesConfig: ServicesConfig
    )
    {
        // Set the default
        this.rental = new RentalModel();

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {        
        this.cargarRangoTiempos();
        // Subscribe to update product on changes
        this._rentalService.onRentalChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(rental => {

                if ( rental )
                {
                    this.rental = new RentalModel(rental);
                    this.pageType = 'edit';
                    this.loadCurrentRentalStatus(rental);
                    this.cargarInfoProduct(rental);
                    this.cargarInfoBorrower(rental);
                    this.rentalPricerReadonly = true;         
                    this.viewTotalPrice = true;           
                    this.rental_total_price = this.rental.rent_total_price;
                }
                else
                {
                    this.pageType = 'new';
                    this.rental = new RentalModel();
                    // this.cargarInfoNewLender();
                }

                this.rentalForm = this.createRentalForm();
            });
    }
    cargarRangoTiempos(): void {
        this.listRangoTiempos = this._rentalService.getRangeHours();
    }
    loadCurrentRentalStatus(rental): void {
        if (rental.rent_stat_reg === '1') {
            this.rent_current_status = 'Habilitado';
            this.checkedStatusProduct = true;
        } else {
            this.rent_current_status = 'Deshabilitado';
            this.checkedStatusProduct = false;
        }
    }
    onSearchProductChange(event): void {
        if (event.length === 16) {
            const body = {
                prod_id: event
            };
            this._productService.detailsProduct(body).subscribe(
                data => {                                                
                    if (data.res_service === 'ok') {
                        if (data.data_result.Item != null) {

                            if (data.data_result.Item.prod_est_alquiler === 'Alquilado') {
                                this.prodInformation = false;
                                this._matSnackBar.open('El artículo ya se encuentra en alquiler', 'Aceptar', {
                                    verticalPosition: 'top',
                                    duration: 5000
                                });
                                this.rentalForm.controls.rent_prod_id.patchValue('');
                            } else {
                                this.prodInformation = true;
                                this.product = data.data_result.Item;
                            }                            
                        } else {
                            this.prodInformation = false;
                            this._matSnackBar.open('Artículo no existe o deshabilitado', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 3000
                            });
                            this.rentalForm.controls.rent_prod_id.patchValue('');
                        }
                    } else {
                        this.prodInformation = false;
                    }
                }
            );
        } else {
            this.prodInformation = false;
        }
    }

    navigateToProductDetails(): void {
        this.router.navigateByUrl('/products/product/' + this.product.prod_id + '/' + this.product.prod_slug);
    }
    navigateToLenderDetails(): void {
        this.router.navigateByUrl('/lenders/lender/' + this.product.lender.user_id + '/' + this.product.lender.user_slug);
    }

    onSearchBorrowChange(event): void {
        if (event.length === 16) {
            const body = {
                user_id : event,
                catg_ids : [
                    {
                        catg_id : this._appCategConfig.getBorrowerCategory()
                    },
                    {
                        catg_id : this._appCategConfig.getLenderBorrowerCategory()
                    }
                ]
            };
            this._userService.detailsUser(body).subscribe(
                data => {                    
                    if (data.res_service === 'ok'){                        
                        if (data.data_result.Count > 0){
                                this.borrowerInformation = true;
                                this.borrower = data.data_result.Items[0]; 
                        } else {
                            this.borrowerInformation = false;
                            this._matSnackBar.open('Prestatario no existe o deshabilitado', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 3000
                            });
                            this.rentalForm.controls.rent_borrow_id.patchValue('');
                        }
                    } else {
                        this.borrowerInformation = false;
                    }
                }
            );
        } else {
            this.borrowerInformation = false;
        }
    }
    navigateToBorrower(): void {        
        this.router.navigateByUrl('/borrowers/borrower/' + this.borrower.user_id + '/' + this.borrower.user_slug);  
    }
    cargarInfoProduct(rental): void {
        const body = {
            prod_id: rental.rent_prod_id
        };
        this._productService.detailsProduct(body).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    if (data.data_result.Item != null) {
                        this.prodInformation = true;
                        this.product = data.data_result.Item;
                    } else {
                        this.prodInformation = false;
                        this._matSnackBar.open('Artículo no existe o deshabilitado', 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 3000
                        });
                        this.rentalForm.controls.rent_prod_id.patchValue('');
                    }
                } else {
                    this.prodInformation = false;
                }
            }
        );
    }
    cargarInfoBorrower(rental): void {
        const body = {
            user_id: rental.rent_borrow_id,
            catg_ids: [
                {
                    catg_id: this._appCategConfig.getBorrowerCategory()
                },
                {
                    catg_id: this._appCategConfig.getLenderBorrowerCategory()
                }
            ]
        };
        this._userService.detailsUser(body).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    if (data.data_result.Count > 0) {
                        this.borrowerInformation = true;
                        this.borrower = data.data_result.Items[0];
                    } else {
                        this.borrowerInformation = false;
                        this._matSnackBar.open('Prestatario no existe o deshabilitado', 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 3000
                        });
                        this.rentalForm.controls.rent_borrow_id.patchValue('');
                    }
                } else {
                    this.borrowerInformation = false;
                }
            }
        );
    }
    // cargarInfoNewLender(): void {
    //     this._activatedRoute.params.subscribe(params => {
    //         if (params.user_id){

    //             const body = {
    //                 user_id : event,
    //                 catg_ids : [
    //                     {
    //                         catg_id : this._appCategConfig.getLenderCategory()
    //                     },
    //                     {
    //                         catg_id : this._appCategConfig.getLenderBorrowerCategory()
    //                     }
    //                 ]
    //             };

    //             this._userService.detailsUser(body).subscribe(
    //                 data => {
    //                     if (data.res_service === 'ok') {
    //                         if (data.data_result.Item != null) {
    //                             this.borrowerInformation = true;
    //                             this.borrower = data.data_result.Item;
    //                             this.rentalForm.controls.lender_user_id.patchValue(params.user_id);
    //                             this.readonlyBorrower = true;
    //                         } else {
    //                             this.borrowerInformation = false;
    //                             this._matSnackBar.open('Prestamista no existe o deshabilitado', 'Aceptar', {
    //                                 verticalPosition: 'top',
    //                                 duration: 3000
    //                             });
    //                             this.rentalForm.controls.lender_user_id.patchValue('');
    //                         }
    //                     } else {
    //                         this.borrowerInformation = false;
    //                     }
    //                 }
    //             );
    //         }
    //     });
    // }

    navigateToLender(): void {
        this.router.navigateByUrl('lenders/lender/' + this.borrower.user_id + '/' + this.borrower.user_slug);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create rental form
     *
     * @returns {FormGroup}
     */
    createRentalForm(): FormGroup
    {                
        let rangeDates;
        if (this.pageType === 'edit') {
            let fec_start = '';
            const parts_start = this.rental.rent_range_date.rent_start.split('/');
            fec_start = (new Date(parts_start[2], parts_start[1] - 1, parts_start[0])).toISOString();    
            
            let fec_end = '';
            const parts_end = this.rental.rent_range_date.rent_end.split('/');
            fec_end = (new Date(parts_end[2], parts_end[1] - 1, parts_end[0])).toISOString(); 

            rangeDates = {
                begin: fec_start,
                end: fec_end
            };
        }
        let last_status_id = 1;
        if (this.rental.rent_status.length > 0){
            this.listCurrentStatus = this.rental.rent_status;
            this.rental.rent_status.forEach(element => {                
                if (element.status_id > last_status_id) {
                    last_status_id = element.status_id;
                } else {
                    last_status_id = element.status_id;
                }                        
            });
        }
        const prodFormBuild = this._formBuilder.group({         
            rent_id                       : [this.rental.rent_id],   
            rent_borrow_id                : [this.rental.rent_borrow_id],
            rent_prod_id                  : [this.rental.rent_prod_id],
            rent_range_date               : [rangeDates],            
            rent_start_address_rec        : [this.rental.rent_start_address_rec],
            rent_start_address_rec_ref    : [this.rental.rent_start_address_rec_ref],
            rent_start_time_range_rec_id  : [this.rental.rent_start_time_range_rec.range_id],            
            rent_end_address_rec          : [this.rental.rent_end_address_rec],
            rent_end_address_rec_ref      : [this.rental.rent_end_address_rec_ref],
            rent_end_time_range_rec_id    : [this.rental.rent_end_time_range_rec.range_id],
            rent_status_id                : [last_status_id],   

            rent_days                     : [this.rental.rent_days],
            rent_days_price               : [this.rental.rent_days_price],
            rent_shipping_delivery        : [this.rental.rent_shipping_delivery],
            rent_shipping_return          : [this.rental.rent_shipping_return], 
            rent_commission               : [this.rental.rent_commission],   
            rent_total_price              : [this.rental.rent_total_price],      
            rent_warranty                 : [this.rental.rent_warranty],
            payment_link                  : [this.rental.payment_link],
            rent_stat_reg                 : [this.rental.rent_stat_reg],   
            rent_date_reg                 : [this.rental.rent_date_reg],   
            rent_usur_reg                 : [this.rental.rent_usur_reg],   
            rent_date_upt                 : [this.rental.rent_date_upt],   
            rent_usur_upt                 : [this.rental.rent_usur_upt],
        });              
        return prodFormBuild;
    }

    addTagProduct(event): void {
        const input = event.input;
        const value = event.value;
        if ( value )
        {
            this.product.prod_tags.push(value);
        }
        if ( input )
        {
            input.value = '';
        }
    }

    removeTagProduct(tagProduct): void {
        const index = this.product.prod_tags.indexOf(tagProduct);
        if ( index >= 0 )
        {
            this.product.prod_tags.splice(index, 1);
        }
    }

    /**
     * Save product
     */
    saveProduct(): void
    {
        const rentalSave: RentalModel = new RentalModel();
        rentalSave.rent_id = this.rentalForm.value.rent_id;
        rentalSave.rent_borrow_id = this.rentalForm.value.rent_borrow_id;
        rentalSave.rent_prod_id = this.rentalForm.value.rent_prod_id;
        rentalSave.rent_range_date = {
            rent_start: this.registroUtil.obtenerDateFormatFecNac(this.rentalForm.value.rent_range_date.begin),
            rent_end: this.registroUtil.obtenerDateFormatFecNac(this.rentalForm.value.rent_range_date.end)
        };

        rentalSave.rent_start_address_rec = this.rentalForm.value.rent_start_address_rec;
        rentalSave.rent_start_address_rec_ref = this.rentalForm.value.rent_start_address_rec_ref;
        rentalSave.rent_start_time_range_rec = {
            max_range: this.listRangoTiempos.find(x => x.value === this.rentalForm.value.rent_start_time_range_rec_id).max,
            min_range: this.listRangoTiempos.find(x => x.value === this.rentalForm.value.rent_start_time_range_rec_id).min,
            range_id: this.rentalForm.value.rent_start_time_range_rec_id
        };

        rentalSave.rent_end_address_rec = this.rentalForm.value.rent_end_address_rec;
        rentalSave.rent_end_address_rec_ref = this.rentalForm.value.rent_end_address_rec_ref;
        rentalSave.rent_end_time_range_rec = {
            max_range: this.listRangoTiempos.find(x => x.value === this.rentalForm.value.rent_end_time_range_rec_id).max,
            min_range: this.listRangoTiempos.find(x => x.value === this.rentalForm.value.rent_end_time_range_rec_id).min,
            range_id: this.rentalForm.value.rent_end_time_range_rec_id
        };
        rentalSave.rent_status = this.obtenerListStatusRental();
        rentalSave.rent_date_upt = this.registroUtil.obtenerFechaCreacion();
        rentalSave.rent_usur_upt = this.securityService.getUserLogedId();

        this._rentalService.updateRental(rentalSave).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    this._matSnackBar.open('Alquiler actualizado', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000
                    });
                } else {
                    this._matSnackBar.open('Error actualizando el alquiler', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000
                    });
                }
            }
        );
    }

    /**
     * Add product
     */
    addRental(): void
    {
        const rentalSave: RentalModel = new RentalModel();
        rentalSave.rent_borrow_id = this.rentalForm.value.rent_borrow_id;
        rentalSave.rent_prod_id = this.rentalForm.value.rent_prod_id;
        rentalSave.rent_range_date = {
            rent_start: this.registroUtil.obtenerDateFormatFecNac(this.rentalForm.value.rent_range_date.begin),
            rent_end: this.registroUtil.obtenerDateFormatFecNac(this.rentalForm.value.rent_range_date.end)
        };

        rentalSave.rent_start_address_rec = this.rentalForm.value.rent_start_address_rec;
        rentalSave.rent_start_address_rec_ref = this.rentalForm.value.rent_start_address_rec_ref;
        rentalSave.rent_start_time_range_rec = {
            max_range: this.listRangoTiempos.find(x => x.value === this.rentalForm.value.rent_start_time_range_rec_id).max,
            min_range: this.listRangoTiempos.find(x => x.value === this.rentalForm.value.rent_start_time_range_rec_id).min,
            range_id: this.rentalForm.value.rent_start_time_range_rec_id.toString()
        };
        
        rentalSave.rent_end_address_rec = this.rentalForm.value.rent_end_address_rec;
        rentalSave.rent_end_address_rec_ref = this.rentalForm.value.rent_end_address_rec_ref;
        rentalSave.rent_end_time_range_rec = {
            max_range: this.listRangoTiempos.find(x => x.value === this.rentalForm.value.rent_end_time_range_rec_id).max,
            min_range: this.listRangoTiempos.find(x => x.value === this.rentalForm.value.rent_end_time_range_rec_id).min,
            range_id: this.rentalForm.value.rent_end_time_range_rec_id.toString()
        };        
        rentalSave.rent_status = this.obtenerListStatusRental();
        rentalSave.rent_date_reg = this.registroUtil.obtenerFechaCreacion();
        rentalSave.rent_usur_reg = this.securityService.getUserLogedId();   

        rentalSave.rent_days = this.rentalForm.value.rent_days.toString();
        rentalSave.rent_days_price = this.rentalForm.value.rent_days_price;
        rentalSave.rent_shipping_delivery = this.rentalForm.value.rent_shipping_delivery;
        rentalSave.rent_shipping_return = this.rentalForm.value.rent_shipping_return;
        rentalSave.rent_commission = this.rentalForm.value.rent_commission;
        rentalSave.rent_total_price = this.rentalForm.value.rent_total_price;  
        rentalSave.rent_warranty = this.rentalForm.value.rent_warranty;
              
        this._rentalService.createRental(rentalSave).subscribe(
            data => {                
                if (data.res_service === 'ok') {
                    this._matSnackBar.open('Alquiler registrado', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000
                    });
                    const bodyPaymentLink = {
                        rent_id: data.data_result.rent_id,
                        payment_link: this._servicesConfig.getDomainName() + data.data_result.rent_id + '/secured'
                    };
                    this._rentalService.updatePaymentLink(bodyPaymentLink).subscribe(
                        dataPaymentLink => {
                            this._matSnackBar.open('Link de pago creado', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 3000
                            });
                            this.router.navigateByUrl('rents/rental/' + data.data_result.rent_id + '/details');
                        }
                    );
                    const bodyUpdateStatus = {
                        prod_id: this.rentalForm.value.rent_prod_id,
                        prod_est_alquiler: 'Alquilado'
                    };
                    this._rentalService.updateProductStatus(bodyUpdateStatus).subscribe(
                        dataUpdateProduct => {
                            console.log('status actualizado alquilado');
                        }
                    );
                } else {
                    this._matSnackBar.open('Error registrando el alquiler', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000
                    });
                }                         
            }
        );
    }

    obtenerListStatusRental(): any {
        if (this.listCurrentStatus.length > 0){                                 
            const exist_id = this.listCurrentStatus.find(x => x.status_id === this.rentalForm.value.rent_status_id);
            if (!exist_id) {
                let bodyUpdateStatus;           
                this.listCurrentStatus.push(
                    {
                        status_id: this.rentalForm.value.rent_status_id,
                        status_text: this.listEstatusRental.find(x => x.value === this.rentalForm.value.rent_status_id).text,
                        status_date: this.registroUtil.obtenerFechaCreacion()
                    }
                );
                if (this.rentalForm.value.rent_status_id === 4) {
                    bodyUpdateStatus = {
                        prod_id: this.rentalForm.value.rent_prod_id,
                        prod_est_alquiler: 'Disponible'
                    };
                    this._rentalService.updateProductStatus(bodyUpdateStatus).subscribe(
                        data => {
                            console.log('status actualizado disponible');
                        }
                    );
                }
            }
            return this.listCurrentStatus;
        } else {   
            return [
                {
                    status_id: this.rentalForm.value.rent_status_id.toString(),
                    status_text: this.listEstatusRental.find(x => x.value === this.rentalForm.value.rent_status_id).text,
                    status_date: this.registroUtil.obtenerFechaCreacion()
                }
            ];
        }
    }

    copyClipBoardLenderId(user_id): void {

        const selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = user_id;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);

        document.execCommand('copy');

        this._matSnackBar.open('Código copiado', 'Aceptar', {
            verticalPosition: 'top',
            duration: 3000
        });
    }

    copyClipBoardLenderLink(link): void {
        const selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = link;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);

        document.execCommand('copy');

        this._matSnackBar.open('Link     copiado', 'Aceptar', {
            verticalPosition: 'top',
            duration: 3000
        });
    }

    changeStatusProduct(event): void {
        let current_status = '0';
        let current_status_msg = 'Deshabilitado';

        if (event.checked) {
            current_status = '1';
            current_status_msg = 'Habilitado';
        } else {
            current_status = '0';
            current_status_msg = 'Deshabilitado';
        }

        const bodyDelete = {
            prod_id : this.product.prod_id,
            prod_est_registro: current_status
        };

        this._rentalService.deleteRental(bodyDelete).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    this.rent_current_status = current_status_msg;
                    this._matSnackBar.open('Artículo ' + current_status_msg, 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000
                    });
                } else {
                    this._matSnackBar.open('Error actualizando la información', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000
                    });
                }
            }
        );
    }

    changeRangeRental(value): void{        
        const oneDay = 24 * 60 * 60 * 1000;
        const dateStart = value.value.begin;
        const dateEnd = value.value.end;
        const diffDays = Math.round(Math.abs((dateStart.getTime() - dateEnd.getTime()) / (oneDay))) + 1;        
        this.rentalForm.controls.rent_days.patchValue(diffDays);
        this.calculateRentalPrice();
    }

    calculateRentalPrice(): void {

        let rental_price = 0;
        let price_w_dely = 0;
        let comission_price = 0;        
        if (this.rentalForm.value.rent_days !== '' && 
            this.rentalForm.value.rent_days_price !== '' && 
            this.rentalForm.value.rent_shipping_delivery !== '' &&
            this.rentalForm.value.rent_shipping_return !== '' && 
            this.rentalForm.value.rent_commission !== '') {
                rental_price = this.rentalForm.value.rent_days * this.rentalForm.value.rent_days_price;                
                price_w_dely = Number(this.rentalForm.value.rent_shipping_delivery) + 
                               Number(this.rentalForm.value.rent_shipping_return) + 
                               rental_price;
                comission_price = rental_price * (this.rentalForm.value.rent_commission / 100);
                this.rental_total_price = (price_w_dely + comission_price).toFixed(2);
                this.rental_total_price = (Number(this.rental_total_price) + Number(this.rentalForm.value.rent_warranty)).toFixed(2);
                this.rentalForm.controls.rent_total_price.patchValue(this.rental_total_price);
                this.viewTotalPrice = true;
        } else {
            this.viewTotalPrice = false;
        }
    }

}
