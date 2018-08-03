import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { EcommerceProductService } from '../../../../services/product.service';
import { Product } from '../../../../models/product.model';

@Component({
    selector     : 'e-commerce-product',
    templateUrl  : './product.component.html',
    styleUrls    : ['./product.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class EcommerceProductComponent implements OnInit, OnDestroy
{
    product: Product;
    pageType: string;
    productForm: FormGroup;
    rangoPreciosArrayForm: FormArray;
    
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
        private _location: Location,
        private _matSnackBar: MatSnackBar
    )
    {
        // Set the default
        this.product = new Product();

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
        this.rangoPreciosArrayForm = new FormArray(
            [
            ]
        );
        // Subscribe to update product on changes
        this._ecommerceProductService.onProductChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(product => {

                if ( product )
                {
                    this.product = new Product(product);
                    this.pageType = 'edit';
                }
                else
                {
                    this.pageType = 'new';
                    this.product = new Product();
                }

                this.productForm = this.createProductForm();
            });
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
     * Create product form
     *
     * @returns {FormGroup}
     */
    createProductForm(): FormGroup
    {
        
        this.product.prod_rango_precios.forEach(element => {
            const formGroup = this._formBuilder.group(
                {
                    rango: element.rango,
                    precio: element.precio
                }
            );
            this.rangoPreciosArrayForm.push(formGroup);
        });

        return this._formBuilder.group({            
            prod_nombre         : [this.product.prod_nombre],
            prod_desc           : [this.product.prod_desc],
            prod_tags           : [this.product.prod_tags],
            prod_slug           : [this.product.prod_slug],
            prod_categoria      : [this.product.prod_categoria],
            prod_rango_precios  : [this.rangoPreciosArrayForm],
            prod_dir_entrega    : [this.product.prod_dir_entrega],
            prod_hora_entrega   : [this.product.prod_hora_entrega],
            prod_dir_recibe     : [this.product.prod_dir_recibe],
            prod_hora_recibe    : [this.product.prod_hora_recibe],
            prod_est_alquiler   : [this.product.prod_est_alquiler],
            prod_est_registro   : [this.product.prod_est_registro],
            prod_fec_registro   : [this.product.prod_fec_registro],
            prod_usu_registro   : [this.product.prod_usu_registro]
        });
    }

    agregarRangoPrecio(): void {
        const formGroup = this._formBuilder.group(
            {
                rango: [''],
                precio: ['']
            }
        );
        this.rangoPreciosArrayForm.push(formGroup);
    }

    eliminarRangoPrecio(rango): void {        
        this.rangoPreciosArrayForm.removeAt(this.rangoPreciosArrayForm.value.findIndex(x => x.precio === rango.value.precio));
    }

    /**
     * Save product
     */
    saveProduct(): void
    {
        const dataEdit = this.productForm.value;
        const dataArrayRangos = dataEdit.prod_rango_precios.value;
        this._ecommerceProductService.actualizarProducto(dataEdit, dataArrayRangos).subscribe(
            data => {
                console.log(data);
                this._matSnackBar.open('Artículo actualizado', 'OK', {
                    verticalPosition: 'top',
                    duration: 3000
                });                
            }
        );
    }

    /**
     * Add product
     */
    addProduct(): void
    {
        // const data = this.productForm.getRawValue();
        // data.handle = FuseUtils.handleize(data.name);

        // this._ecommerceProductService.addProduct(data)
        //     .then(() => {

        //         // Trigger the subscription with new data
        //         this._ecommerceProductService.onProductChanged.next(data);

        //         // Show the success message
        //         this._matSnackBar.open('Product added', 'OK', {
        //             verticalPosition: 'top',
        //             duration        : 2000
        //         });

        //         // Change the location with new one
        //         this._location.go('apps/e-commerce/products/' + this.product.prod_id + '/' + this.product.prod_slug);
        //     });
    }
}
