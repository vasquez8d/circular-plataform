import { Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { EcommerceProductService } from '../../../../services/product.service';
import { Product } from '../../../../models/product.model';
import { CategorysService } from '../../../../services/categorys.service';
import { SecurityService } from '../../../../services/security.service';
import { RegistroUtil } from '../../../../utils/registro.util';
import { Router, ActivatedRoute } from '../../../../../../node_modules/@angular/router';
import { ImageUploadComponent } from '../../images/imageUpload/image-upload.component';
import { ImageViewComponent } from '../../images/imageViewer/imageview.component';
import { S3Service } from '../../../../services/s3.service';
import { AppCategoryConfig } from '../../../../app-config/app-categorys.config';
import * as base64Converter from 'base64-arraybuffer';
import { UserService } from '../../../../services/user.service';
import { UserModel } from '../../../../models/user.model';

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
    listadoCategorias = [];

    // Buscador Lenders    
    lenderInformation = false;
    public lender = new UserModel();
    public readonlyLender = false;
    // Imagenes
    listImages = [];
    listImagesGuardar = [];
    listCurrentImages = [];
    listImagesUpload = [];
    bNewImages = false;
    public imageUploaded = true;

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
    public listTiempos = [
        {
            value : 1,
            text  : 'Días'
        },
        {
            value : 2,
            text  : 'Meses'
        },
        {
            value : 1,
            text  : 'Años'
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
        public dialog: MatDialog,
        private _s3Service: S3Service,
        private appCategoryConfig: AppCategoryConfig,
        private _userService: UserService,
        private _activatedRoute: ActivatedRoute,
        private _appCategConfig: AppCategoryConfig
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
                    this.cargarDocumentos(this.product.prod_url_documen);
                    this.loadCurrentStatusProduct(product);
                    this.cargarInfoLender(product);
                    this.cargarEstadoConvervaText(product);
                }
                else
                {
                    this.pageType = 'new';
                    this.product = new Product();
                    this.cargarInfoNewLender();
                }

                this.productForm = this.createProductForm();
            });
    }

    cargarEstadoConvervaText(product): void {
        if (product.prod_est_converva.est_value > 7) {
            this.prd_est_conversva = 'Perfecto';
        }
        else if (product.prod_est_converva.est_value > 4) {
            this.prd_est_conversva = 'Sin detalles';
        }
        else if (product.prod_est_converva.est_value > 2) {
            this.prd_est_conversva = 'Con algún detalle';
        }
        else if (product.prod_est_converva.est_value > 0) {
            this.prd_est_conversva = 'Funcional';
        }
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
                user_id : event,
                catg_id : this._appCategConfig.getLenderCategory()
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
                            this.productForm.controls.lender_user_id.patchValue('');
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
            user_id: product.lender.user_id,            
            catg_id: this._appCategConfig.getLenderCategory()
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
                        this.productForm.controls.lender_user_id.patchValue('');
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
                    user_id: params.user_id,
                    catg_id: this._appCategConfig.getLenderCategory()
                };
                this._userService.detailsLender(body).subscribe(
                    data => {
                        if (data.res_service === 'ok') {
                            if (data.data_result.Item != null) {
                                this.lenderInformation = true;
                                this.lender = data.data_result.Item;
                                this.productForm.controls.lender_user_id.patchValue(params.user_id);
                                this.readonlyLender = true;
                            } else {
                                this.lenderInformation = false;
                                this._matSnackBar.open('Prestamista no existe o deshabilitado', 'Aceptar', {
                                    verticalPosition: 'top',
                                    duration: 3000
                                });
                                this.productForm.controls.lender_user_id.patchValue('');
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

    cargarDocumentos(documents): void {
        documents.forEach(element => {
            const datas3Body = {
                app_key: element.image_key,
                app_catg_id: this.appCategoryConfig.getProductCategory()
            };
            this._s3Service.getImageS3(datas3Body).subscribe(
                data => {
                    if (data.res_service === 'ok') {
                        const image = {
                            data: base64Converter.encode(data.data_result.Body.data),
                            desc: element
                        };
                        this.listCurrentImages.push(element);
                        this.listImages.push(image);
                    }
                }
            );
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
         
        const prodFormBuild = this._formBuilder.group({            
            lender_user_id      : [this.product.lender.user_id],
            prod_id             : [this.product.prod_id],
            prod_nombre         : [this.product.prod_nombre],
            prod_desc           : [this.product.prod_desc],
            prod_tags           : [this.product.prod_tags],

            prod_est_converva_value   : [this.product.prod_est_converva.est_value],
            prod_est_converva_desc    : [this.product.prod_est_converva.est_desc],

            prod_time_uso_value       : [this.product.prod_time_uso.time_value],
            prod_time_uso_id          : [this.product.prod_time_uso.time_id],

            prod_val_merca_value      : [this.product.prod_val_merca.val_value],
            prod_val_merca_moneda_id  : [this.product.prod_val_merca.val_moneda_id],
            prod_val_merca_ref_price  : [this.product.prod_val_merca.val_ref_price],

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
        return prodFormBuild;
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
        productSave.lender = {
            user_id: this.lender.user_id,
            user_slug: this.lender.user_slug
        };
        productSave.prod_nombre = this.productForm.value.prod_nombre;
        productSave.prod_desc = this.productForm.value.prod_desc;
        productSave.prod_est_converva = {
            est_value: this.productForm.value.prod_est_converva_value,
            est_desc: this.productForm.value.prod_est_converva_desc,
            est_text: this.prd_est_conversva
        };
        productSave.prod_time_uso = {
            time_value: this.productForm.value.prod_time_uso_value,
            time_id: this.productForm.value.prod_time_uso_id,
            time_text: this.obtenerTiempoTextSelected(this.productForm.value.prod_time_uso_id)
        };
        productSave.prod_val_merca = {
            val_value: this.productForm.value.prod_val_merca_value,
            val_moneda_id: this.productForm.value.prod_val_merca_moneda_id,
            val_ref_price: this.productForm.value.prod_val_merca_ref_price,
            val_moneda_text: this.obtenerTipoMonedaSelected(this.productForm.value.prod_val_merca_moneda_id)
        };
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
                if (data.res_service === 'ok') {
                    this._matSnackBar.open('Artículo actualizado', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000
                    });

                    if (this.bNewImages) {
                        const listImagesGuardar = [];
                        // tslint:disable-next-line:typedef
                        this.listImages.forEach(function (element, index, theArray) {
                            const dataUpload = {
                                imageString64: element.data,
                                app_id: this.product.prod_id,
                                app_categ_id: this.appCategoryConfig.getProductCategory()
                            };
                            const existImage = this.listCurrentImages.find(x => x.image_key === element.desc.image_key);
                            if (existImage == null) {
                                this._s3Service.uploadImageS3(dataUpload).subscribe(
                                    responseUpload => {
                                        const data_image = {
                                            image_key: responseUpload.data_result.fileName,
                                            image_desc: element.desc.image_desc
                                        };
                                        listImagesGuardar.push(data_image);
                                        const dataUploadFileName = {
                                            app_id: this.product.prod_id,
                                            app_url_documen: listImagesGuardar,
                                            app_categ: this.appCategoryConfig.getProductCategory()
                                        };
                                        theArray[index] = {
                                            data: element.data,
                                            desc: {
                                                image_key: responseUpload.data_result.fileName,
                                                image_desc: element.desc.image_desc
                                            }
                                        };
                                        const newImage = {
                                            image_key: responseUpload.data_result.fileName,
                                            image_desc: element.desc.image_desc
                                        };
                                        this.listCurrentImages.push(newImage);
                                        this._s3Service.uploadFileName(dataUploadFileName).subscribe(
                                            resultUploadFileName => {
                                                this._matSnackBar.open('Documentos agregados', 'Aceptar', {
                                                    verticalPosition: 'top',
                                                    duration: 3000
                                                });
                                            }
                                        );
                                    }
                                );
                            } else {
                                const data_image = {
                                    image_key: existImage.image_key,
                                    image_desc: existImage.image_desc
                                };
                                listImagesGuardar.push(data_image);
                            }
                        }, this);
                    }
                } else {
                    this._matSnackBar.open('Error actualizando la información del prestamista', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000
                    });
                }              
            }
        );
    }

    obtenerTiempoTextSelected(value): any {
        return this.listTiempos.find(x => x.value === value).text;
    }

    obtenerTipoMonedaSelected(value): any {
        return this.listTipoMonedas.find(x => x.value === value).text;
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
        productSave.lender = {
            user_id: this.lender.user_id,
            user_slug: this.lender.user_slug
        };
        productSave.prod_desc = this.productForm.value.prod_desc;
        productSave.prod_tags = this.productForm.value.prod_tags;
        productSave.prod_est_converva = {
            est_value: this.productForm.value.prod_est_converva_value.toString(),
            est_desc: this.productForm.value.prod_est_converva_desc,
            est_text: this.prd_est_conversva
        };
        productSave.prod_time_uso = {
            time_value: this.productForm.value.prod_time_uso_value.toString(),
            time_id: this.productForm.value.prod_time_uso_id.toString(),
            time_text: this.obtenerTiempoTextSelected(this.productForm.value.prod_time_uso_id)
        };
        productSave.prod_val_merca = {
            val_value: this.productForm.value.prod_val_merca_value.toString(),
            val_moneda_id: this.productForm.value.prod_val_merca_moneda_id.toString(),
            val_ref_price: this.productForm.value.prod_val_merca_ref_price,
            val_moneda_text: this.obtenerTipoMonedaSelected(this.productForm.value.prod_val_merca_moneda_id)
        };
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
                if (data.res_service === 'ok') {
                    this._matSnackBar.open('Artículo registrado', 'OK', {
                        verticalPosition: 'top',
                        duration: 3000
                    });
                    const listImagesGuardar = [];
                    this.listImages.forEach(element => {
                        const dataUpload = {
                            imageString64: element.data,
                            app_id: data.data_result.prod_id,
                            app_categ_id: this.appCategoryConfig.getProductCategory()
                        };
                        this._s3Service.uploadImageS3(dataUpload).subscribe(
                            responseUpload => {
                                const data_image = {
                                    image_key: responseUpload.data_result.fileName,
                                    image_desc: element.desc.image_desc
                                };
                                listImagesGuardar.push(data_image);
                                const dataUploadFileName = {
                                    app_id: data.data_result.prod_id,
                                    app_url_documen: listImagesGuardar,
                                    app_categ: this.appCategoryConfig.getProductCategory()
                                };
                                this._s3Service.uploadFileName(dataUploadFileName).subscribe(
                                    resultUploadFileName => {
                                        this._matSnackBar.open('Documentos agregados', 'Aceptar', {
                                            verticalPosition: 'top',
                                            duration: 3000
                                        });
                                    }
                                );
                            }
                        );
                    });
                }         
                this.router.navigateByUrl('/products/product/' + data.data_result.prod_id + '/' + productSave.prod_slug);
            }
        );
    }

    viewImageComplete(image): void {
        const dialogRef = this.dialog.open(ImageViewComponent, {
            data: {
                data_image: image.data,
                info_image: image.desc
            }
        });
        dialogRef.afterClosed().subscribe(result => {
        });
    }

    uploadDocument(): void {
        const dialogRef = this.dialog.open(ImageUploadComponent, {
            data: {
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const image = {
                    data: result.data_image,
                    desc: {
                        image_desc: result.data_desc
                    }
                };
                this.listImages.push(image);
                this.imageUploaded = false;
                try {
                    (<HTMLInputElement>document.getElementById('btnSaveProduct')).disabled = false;
                } catch (e) { }

                if (this.pageType === 'edit') {
                    this.bNewImages = true;
                }
            }
        });
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
