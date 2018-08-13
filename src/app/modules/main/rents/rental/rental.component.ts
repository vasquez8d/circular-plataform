import { Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar} from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { EcommerceProductService } from '../../../../services/product.service';
import { Product } from '../../../../models/product.model';
import { CategorysService } from '../../../../services/categorys.service';
import { SecurityService } from '../../../../services/security.service';
import { RegistroUtil } from '../../../../utils/registro.util';
import { Router, ActivatedRoute } from '../../../../../../node_modules/@angular/router';
import { S3Service } from '../../../../services/s3.service';
import { AppCategoryConfig } from '../../../../app-config/app-categorys.config';
import { UserService } from '../../../../services/user.service';
import { UserModel } from '../../../../models/user.model';
import { RentalModel } from '../../../../models/rental.model';

@Component({
    selector     : 'e-commerce-rental',
    templateUrl  : './rental.component.html',
    styleUrls    : ['./rental.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class RentalComponent implements OnInit, OnDestroy
{
    rental: RentalModel;
    pageType: string;
    rentalForm: FormGroup;

    // Date Range Picker

    // Buscador Lenders    
    lenderInformation = false;
    public lender = new UserModel();
    public readonlyLender = false;

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
    public listRangoTiempos = [
        {
            value : 1,
            text  : 'De 8:00 a.m. a 11:00 a.m.',
            min   : '8:00',
            max   : '9:00' 
        },
        {
            value : 2,
            text  : 'De 9:00 a.m. a 12:00 p.m.',
            min   : '9:00',
            max   : '12:00' 
        },
        {
            value : 3,
            text  : 'De 10:00 a.m. a 1:00 p.m.',
            min   : '10:00',
            max   : '13:00' 
        },
        {
            value : 4,
            text  : 'De 11:00 a.m. a 2:00 p.m.',
            min   : '11:00',
            max   : '14:00' 
        },
        {
            value : 5,
            text  : 'De 12:00 p.m. a 3:00 p.m.',
            min   : '12:00',
            max   : '15:00' 
        },
        {
            value : 6,
            text  : 'De 1:00 p.m. a 4:00 p.m.',
            min   : '13:00',
            max   : '16:00' 
        },
        {
            value : 7,
            text  : 'De 2:00 p.m. a 5:00 p.m.',
            min   : '14:00',
            max   : '17:00' 
        },
        {
            value : 8,
            text  : 'De 3:00 p.m. a 6:00 p.m.',
            min   : '15:00',
            max   : '18:00' 
        },
        {
            value : 9,
            text  : 'De 4:00 p.m. a 7:00 p.m.',
            min   : '16:00',
            max   : '19:00' 
        }
    ];
    
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
        private _ecommerceProductService: EcommerceProductService,
        private _formBuilder: FormBuilder,        
        private _matSnackBar: MatSnackBar,
        private categoryService: CategorysService,
        private registroUtil: RegistroUtil,
        private securityService: SecurityService,
        private router: Router,        
        private _s3Service: S3Service,
        private appCategoryConfig: AppCategoryConfig,
        private _userService: UserService,
        private _activatedRoute: ActivatedRoute
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
        this._ecommerceProductService.onProductChanged
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

    formatLabel(value: number | null): any {
        if (!value) {
          return 0;
        }
        return value;
    }

    chosenYearHandler(event): void {
        console.log(event);
    }
    chosenMonthHandler(event, dp): void {
        console.log(event);
        console.log(dp);
    }
    changeEstConversa(event): void {
        if (event.value > 7) {
            this.prd_est_conversva = 'Perfecto';
        }
        else if (event.value > 4) {
            this.prd_est_conversva = 'Sin detalles';
        }
        else if (event.value > 2) {
            this.prd_est_conversva = 'Con algún detalle';
        }
        else if (event.value > 0) {
            this.prd_est_conversva = 'Funcional';
        }
    }

    onSearchLenderChange(event): void {
        if (event.length === 16) {
            const body = {
                user_id : event
            };
            this._userService.detailsLender(body).subscribe(
                data => {
                    if (data.res_service === 'ok'){
                        if (data.data_result.Item != null){
                            this.lenderInformation = true;
                            this.lender = data.data_result.Item;                            
                        } else {
                            this.lenderInformation = false;
                            this._matSnackBar.open('Prestamista no existe o deshabilitado', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 3000
                            });
                            this.rentalForm.controls.lender_user_id.patchValue('');
                        }
                    } else {
                        this.lenderInformation = false;
                    }
                }
            );
        } else {
            this.lenderInformation = false;
        }
    }

    cargarInfoLender(product): void {        
        const body = {
            user_id: product.lender_user_id
        };
        this._userService.detailsLender(body).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    if (data.data_result.Item != null) {
                        this.lenderInformation = true;
                        this.lender = data.data_result.Item;
                    } else {
                        this.lenderInformation = false;
                        this._matSnackBar.open('Prestamista no existe o deshabilitado', 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 3000
                        });
                        this.rentalForm.controls.lender_user_id.patchValue('');
                    }
                } else {
                    this.lenderInformation = false;
                }
            }
        );
    }

    cargarInfoNewLender(): void {
        this._activatedRoute.params.subscribe(params => {
            if (params.user_id){
                const body = {
                    user_id: params.user_id
                };
                this._userService.detailsLender(body).subscribe(
                    data => {
                        if (data.res_service === 'ok') {
                            if (data.data_result.Item != null) {
                                this.lenderInformation = true;
                                this.lender = data.data_result.Item;
                                this.rentalForm.controls.lender_user_id.patchValue(params.user_id);
                                this.readonlyLender = true;
                            } else {
                                this.lenderInformation = false;
                                this._matSnackBar.open('Prestamista no existe o deshabilitado', 'Aceptar', {
                                    verticalPosition: 'top',
                                    duration: 3000
                                });
                                this.rentalForm.controls.lender_user_id.patchValue('');
                            }
                        } else {
                            this.lenderInformation = false;
                        }
                    }
                );
            }
        });
    }

    navigateToLender(): void {
        this.router.navigateByUrl('lenders/lender/' + this.lender.user_id + '/' + this.lender.user_slug);
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
            rent_lndr_id                  : [this.rental.rent_lndr_id],
            rent_prod_id                  : [this.rental.rent_prod_id],
            rent_start_date               : [this.rental.rent_start_date],
            rent_start_address_rec        : [this.rental.rent_start_address_rec],
            rent_start_address_rec_ref    : [this.rental.rent_start_address_rec_ref],
            rent_start_time_range_rec_id  : [this.rental.rent_start_time_range_rec.range_id],
            rent_end_date                 : [this.rental.rent_end_date],
            rent_end_address_rec          : [this.rental.rent_end_address_rec],
            rent_end_address_rec_ref      : [this.rental.rent_end_address_rec_ref],
            rent_end_time_range_rec_id    : [this.rental.rent_end_time_range_rec.range_id],
            rent_status                   : [this.rental.rent_status],   
            rent_stat_reg                 : [this.rental.rent_stat_reg],   
            rent_date_reg                 : [this.rental.rent_date_reg],   
            rent_usur_reg                 : [this.rental.rent_usur_reg],   
            rent_date_upt                 : [this.rental.rent_date_upt],   
            rent_usur_upt                 : [this.rental.rent_usur_upt],

            rent_range_date               : [this.rental.rent_range_date]
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
        const productSave: Product = new Product();
        productSave.prod_id = this.product.prod_id;
        productSave.lender_user_id = this.rentalForm.value.lender_user_id;
        productSave.prod_nombre = this.rentalForm.value.prod_nombre;
        productSave.prod_desc = this.rentalForm.value.prod_desc;
        productSave.prod_est_converva = {
            est_value: this.rentalForm.value.prod_est_converva_value,
            est_desc: this.rentalForm.value.prod_est_converva_desc
        };
        productSave.prod_time_uso = {
            time_value: this.rentalForm.value.prod_time_uso_value,
            time_id: this.rentalForm.value.prod_time_uso_id
        };
        productSave.prod_val_merca = {
            val_value: this.rentalForm.value.prod_val_merca_value,
            val_moneda_id: this.rentalForm.value.prod_val_merca_moneda_id,
            val_ref_price: this.rentalForm.value.prod_val_merca_ref_price
        };
        productSave.prod_dir_entrega = this.rentalForm.value.prod_dir_entrega;
        productSave.prod_hora_entrega = this.rentalForm.value.prod_hora_entrega;
        productSave.prod_dir_recibe = this.rentalForm.value.prod_dir_recibe;
        productSave.prod_hora_recibe = this.rentalForm.value.prod_hora_recibe;
        productSave.prod_tags = this.rentalForm.value.prod_tags;
        productSave.prod_est_alquiler = 'Disponible';
        productSave.prod_fec_actualiza = this.registroUtil.obtenerFechaCreacion();
        productSave.prod_usu_actualiza = this.securityService.getUserLogedId();        
          
        this._ecommerceProductService.actualizarProducto(productSave).subscribe(
            data => {
                console.log(data);
                if (data.res_service === 'ok') {
                    this._matSnackBar.open('Alquiler actualizado', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000
                    });
                } else {
                    this._matSnackBar.open('Error actualizando la información del alquiler', 'Aceptar', {
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

        this._ecommerceProductService.deleteProduct(bodyDelete).subscribe(
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
