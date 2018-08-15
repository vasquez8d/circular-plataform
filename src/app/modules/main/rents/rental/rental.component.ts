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
    public prod_current_status = '';

    // Estado de conversacion
    public prd_est_conversva = '';
    public listTipoMonedas = [
        {
            value : 1,
            text  : 'Soles'
        },
        {
            value : 2,
            text  : 'Dólares'
        }
    ];
    public listRangoTiempos = [];
    
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {EcommerceProductService} _ecommerceProductService
     * @param {FormBuilder} _formBuilder
     * @param {Location} _location
     * @param {MatSnackBar} _matSnackBar
     */
    constructor(
        private _ecommerceProductService: RentalService,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private registroUtil: RegistroUtil,
        private securityService: SecurityService,
        private router: Router,
        private _userService: UserService,        
        private _activatedRoute: ActivatedRoute,
        private _productService: EcommerceProductService,
        private _appCategConfig: AppCategoryConfig
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
        // Subscribe to update product on changes
        this._ecommerceProductService.onRentalChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(rental => {

                if ( rental )
                {
                    this.rental = new RentalModel(rental);
                    this.pageType = 'edit';                    
                    this.loadCurrentStatusProduct(rental);
                    this.cargarInfoLender(rental);
                }
                else
                {
                    this.pageType = 'new';
                    this.rental = new RentalModel();
                    this.cargarInfoNewLender();
                }

                this.rentalForm = this.createRentalForm();
            });
    }

    loadCurrentStatusProduct(product): void {
        if (product.prod_est_registro === '1') {
            this.prod_current_status = 'Habilitado';
            this.checkedStatusProduct = true;
        } else {
            this.prod_current_status = 'Deshabilitado';
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
                catg_id : this._appCategConfig.getBorrowerCategory()
            };
            this._userService.detailsLender(body).subscribe(
                data => {
                    console.log(data);
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
        console.log(this.borrower);
        this.router.navigateByUrl('/borrowers/borrower/' + this.borrower.user_id + '/' + this.borrower.user_slug);  
    }

    cargarInfoLender(product): void {        
        const body = {
            user_id : event,
            catg_id : this._appCategConfig.getLenderCategory()
        };
        this._userService.detailsLender(body).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    if (data.data_result.Item != null) {
                        this.borrowerInformation = true;
                        this.borrower = data.data_result.Item;
                    } else {
                        this.borrowerInformation = false;
                        this._matSnackBar.open('Prestamista no existe o deshabilitado', 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 3000
                        });
                        this.rentalForm.controls.lender_user_id.patchValue('');
                    }
                } else {
                    this.borrowerInformation = false;
                }
            }
        );
    }

    cargarInfoNewLender(): void {
        this._activatedRoute.params.subscribe(params => {
            if (params.user_id){
                const body = {
                    user_id : event,
                    catg_id : this._appCategConfig.getLenderCategory()
                };
                this._userService.detailsLender(body).subscribe(
                    data => {
                        if (data.res_service === 'ok') {
                            if (data.data_result.Item != null) {
                                this.borrowerInformation = true;
                                this.borrower = data.data_result.Item;
                                this.rentalForm.controls.lender_user_id.patchValue(params.user_id);
                                this.readonlyBorrower = true;
                            } else {
                                this.borrowerInformation = false;
                                this._matSnackBar.open('Prestamista no existe o deshabilitado', 'Aceptar', {
                                    verticalPosition: 'top',
                                    duration: 3000
                                });
                                this.rentalForm.controls.lender_user_id.patchValue('');
                            }
                        } else {
                            this.borrowerInformation = false;
                        }
                    }
                );
            }
        });
    }

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
         
        const prodFormBuild = this._formBuilder.group({         
            rent_id                       : [this.rental.rent_id],   
            rent_borrow_id                : [this.rental.rent_borrow_id],
            rent_prod_id                  : [this.rental.rent_prod_id],
            rent_range_date               : [this.rental.rent_range_date],            
            rent_start_address_rec        : [this.rental.rent_start_address_rec],
            rent_start_address_rec_ref    : [this.rental.rent_start_address_rec_ref],
            rent_start_time_range_rec_id  : [this.rental.rent_start_time_range_rec.range_id],            
            rent_end_address_rec          : [this.rental.rent_end_address_rec],
            rent_end_address_rec_ref      : [this.rental.rent_end_address_rec_ref],
            rent_end_time_range_rec_id    : [this.rental.rent_end_time_range_rec.range_id],
            rent_status                   : [this.rental.rent_status],   
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
        // const productSave: Product = new Product();
        // productSave.prod_id = this.product.prod_id;
        // productSave.lender_user_id = this.rentalForm.value.lender_user_id;
        // productSave.prod_nombre = this.rentalForm.value.prod_nombre;
        // productSave.prod_desc = this.rentalForm.value.prod_desc;
        // productSave.prod_est_converva = {
        //     est_value: this.rentalForm.value.prod_est_converva_value,
        //     est_desc: this.rentalForm.value.prod_est_converva_desc
        // };
        // productSave.prod_time_uso = {
        //     time_value: this.rentalForm.value.prod_time_uso_value,
        //     time_id: this.rentalForm.value.prod_time_uso_id
        // };
        // productSave.prod_val_merca = {
        //     val_value: this.rentalForm.value.prod_val_merca_value,
        //     val_moneda_id: this.rentalForm.value.prod_val_merca_moneda_id,
        //     val_ref_price: this.rentalForm.value.prod_val_merca_ref_price
        // };
        // productSave.prod_dir_entrega = this.rentalForm.value.prod_dir_entrega;
        // productSave.prod_hora_entrega = this.rentalForm.value.prod_hora_entrega;
        // productSave.prod_dir_recibe = this.rentalForm.value.prod_dir_recibe;
        // productSave.prod_hora_recibe = this.rentalForm.value.prod_hora_recibe;
        // productSave.prod_tags = this.rentalForm.value.prod_tags;
        // productSave.prod_est_alquiler = 'Disponible';
        // productSave.prod_fec_actualiza = this.registroUtil.obtenerFechaCreacion();
        // productSave.prod_usu_actualiza = this.securityService.getUserLogedId();        
          
        // this._ecommerceProductService.updateRental(productSave).subscribe(
        //     data => {
        //         console.log(data);
        //         if (data.res_service === 'ok') {
        //             this._matSnackBar.open('Alquiler actualizado', 'Aceptar', {
        //                 verticalPosition: 'top',
        //                 duration: 3000
        //             });
        //         } else {
        //             this._matSnackBar.open('Error actualizando la información del alquiler', 'Aceptar', {
        //                 verticalPosition: 'top',
        //                 duration: 3000
        //             });
        //         }              
        //     }
        // );
    }

    /**
     * Add product
     */
    addProduct(): void
    {
        const rentalSave: RentalModel = new RentalModel();
        rentalSave.rent_range_date = this.rentalForm.value.rent_range_date;
        rentalSave.rent_status = 'Registrado';
        rentalSave.rent_date_reg = this.registroUtil.obtenerFechaCreacion();
        rentalSave.rent_usur_reg = this.securityService.getUserLogedId();
        console.log(rentalSave);
        // this._ecommerceProductService.registrarProducto(productSave).subscribe(
        //     data => {
        //         if (data.res_service === 'ok') {
        //             this._matSnackBar.open('Artículo registrado', 'Aceptar', {
        //                 verticalPosition: 'top',
        //                 duration: 3000
        //             });
        //         } else {
        //             this._matSnackBar.open('Error registrando el alquiler', 'Aceptar', {
        //                 verticalPosition: 'top',
        //                 duration: 3000
        //             });
        //         }         
        //         // this.router.navigateByUrl('/products');
        //     }
        // );
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

        this._ecommerceProductService.deleteRental(bodyDelete).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    this.prod_current_status = current_status_msg;
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

}
