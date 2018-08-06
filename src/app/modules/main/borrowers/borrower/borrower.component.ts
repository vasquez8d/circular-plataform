import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { EcommerceProductService } from '../../../../services/product.service';
import { Product } from '../../../../models/product.model';
import { CategorysService } from '../../../../services/categorys.service';
import { SecurityService } from '../../../../services/security.service';
import { RegistroUtil } from '../../../../utils/registro.util';
import { Router } from '../../../../../../node_modules/@angular/router';

@Component({
    selector     : 'borrower-app',
    templateUrl  : './borrower.component.html',
    styleUrls    : ['./borrower.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class BorrowerComponent implements OnInit, OnDestroy
{
    product: Product;
    pageType: string;
    productForm: FormGroup;
    rangoPreciosArrayForm: FormArray;
    listadoCategorias = [];
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
        private _matSnackBar: MatSnackBar,
        private categoryService: CategorysService,
        private registroUtil: RegistroUtil,
        private securityService: SecurityService,
        private router: Router
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
        this.cargarCategorias();
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

    cargarCategorias(): void{
        this.categoryService.obtenerCategorias().subscribe(
            data => {
                this.listadoCategorias = data.data_result.Items;
            }
        );
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
            catg_id             : [this.product.prod_categoria.catg_id],
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
        productSave.prod_nombre = this.productForm.value.prod_nombre;
        productSave.prod_desc = this.productForm.value.prod_desc;
        productSave.prod_dir_entrega = this.productForm.value.prod_dir_entrega;
        productSave.prod_hora_entrega = this.productForm.value.prod_hora_entrega;
        productSave.prod_dir_recibe = this.productForm.value.prod_dir_recibe;
        productSave.prod_hora_recibe = this.productForm.value.prod_hora_recibe;
        productSave.prod_tags = this.productForm.value.prod_tags;
        productSave.prod_est_alquiler = 'Disponible';
        productSave.prod_fec_actualiza = this.registroUtil.obtenerFechaCreacion();
        productSave.prod_usu_actualiza = this.securityService.getUserLogedId();
        productSave.prod_categoria = this.obtenerCategoriaSeleccionada();
        productSave.prod_rango_precios = this.rangoPreciosArrayForm.value;        
        this._ecommerceProductService.actualizarProducto(productSave).subscribe(
            data => {
                this._matSnackBar.open('Artículo actualizado', 'OK', {
                    verticalPosition: 'top',
                    duration: 3000
                });                
            }
        );
    }

    obtenerCategoriaSeleccionada(): any {
        const catg_id = this.productForm.value.catg_id;
        let catg_nombre = '';
        this.listadoCategorias.forEach(element => {
            if (element.catg_id === catg_id) {
                catg_nombre = element.catg_nombre;
            }
        });
        return {
            catg_id: catg_id,
            catg_nombre: catg_nombre
        };
    }

    /**
     * Add product
     */
    addProduct(): void
    {
        const productSave: Product = new Product();
        productSave.prod_nombre = this.productForm.value.prod_nombre;
        productSave.prod_desc = this.productForm.value.prod_desc;
        productSave.prod_tags = this.productForm.value.prod_tags;
        productSave.prod_slug = this.registroUtil.obtenerSlugPorNombre(productSave.prod_nombre);
        productSave.prod_categoria = this.obtenerCategoriaSeleccionada();
        productSave.prod_rango_precios = this.rangoPreciosArrayForm.value;
        productSave.prod_dir_entrega = this.productForm.value.prod_dir_entrega;
        productSave.prod_hora_entrega = this.productForm.value.prod_hora_entrega;
        productSave.prod_dir_recibe = this.productForm.value.prod_dir_recibe;
        productSave.prod_hora_recibe = this.productForm.value.prod_hora_recibe;
        productSave.prod_est_alquiler = 'Disponible';
        productSave.prod_fec_registro = this.registroUtil.obtenerFechaCreacion();
        productSave.prod_usu_registro = this.securityService.getUserLogedId();               
        this._ecommerceProductService.registrarProducto(productSave).subscribe(
            data => {
                this._matSnackBar.open('Artículo registrado', 'OK', {
                    verticalPosition: 'top',
                    duration: 3000
                });                
                this.router.navigateByUrl('/products');
            }
        );
    }
}
