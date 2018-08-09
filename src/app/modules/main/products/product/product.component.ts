import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
import { MatSnackBar, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { merge, Observable, BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { EcommerceProductService } from '../../../../services/product.service';
import { Product } from '../../../../models/product.model';
import { CategorysService } from '../../../../services/categorys.service';
import { SecurityService } from '../../../../services/security.service';
import { RegistroUtil } from '../../../../utils/registro.util';
import { Router } from '../../../../../../node_modules/@angular/router';
import { FuseUtils } from '@fuse/utils';
import { DataSource } from '@angular/cdk/collections';
import { ImageUploadComponent } from '../../images/imageUpload/image-upload.component';
import { ImageViewComponent } from '../../images/imageViewer/imageview.component';
import { S3Service } from '../../../../services/s3.service';
import { AppCategoryConfig } from '../../../../app-config/app-categorys.config';
import * as base64Converter from 'base64-arraybuffer';

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
    dataSource: FilesDataSource | null;
    displayedColumns = ['prod_id', 'prod_nombre', 'prod_categoria', 'prod_est_alquiler', 'prod_est_registro'];
    @ViewChild(MatPaginator)
    paginator: MatPaginator;
    @ViewChild(MatSort)
    sort: MatSort;
    @ViewChild('filter')
    filter: ElementRef;

    // Imagenes
    listImages = [];
    listImagesGuardar = [];
    listCurrentImages = [];
    listImagesUpload = [];
    bNewImages = false;
    public imageUploaded = true;

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
        private router: Router,
        public dialog: MatDialog,
        private _s3Service: S3Service,
        private appCategoryConfig: AppCategoryConfig
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
                }
                else
                {
                    this.pageType = 'new';
                    this.product = new Product();
                }

                this.productForm = this.createProductForm();
            });


        this.dataSource = new FilesDataSource(this._ecommerceProductService, this.paginator, this.sort);
        console.log(this.dataSource); // CARGA INICIAL
        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(150),
                distinctUntilChanged()
            )
            .subscribe(() => {
                if (!this.dataSource) {
                    return;
                }

                this.dataSource.filter = this.filter.nativeElement.value;
                console.log(this.dataSource); // BUSCADOR
            });
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
        return this._formBuilder.group({            
            lender_user_id      : [this.product.lender_user_id],
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
        productSave.lender_user_id = this.productForm.value.lender_user_id;
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
                console.log(data);
                if (data.res_service === 'ok') {
                    this._matSnackBar.open('Producto actualizado', 'Aceptar', {
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
        productSave.lender_user_id = this.productForm.value.lender_user_id;
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
        console.log(productSave);               
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
                // this.router.navigateByUrl('/products');
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
}


export class FilesDataSource extends DataSource<any>
{
    private _filterChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');

    /**
     * Constructor
     *
     * @param {EcommerceProductService} _ecommerceProductsService
     * @param {MatPaginator} _matPaginator
     * @param {MatSort} _matSort
     */
    constructor(
        private _ecommerceProductService: EcommerceProductService,
        private _matPaginator: MatPaginator,
        private _matSort: MatSort
    ) {
        super();

        this.filteredData = this._ecommerceProductService.products;
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]> {
        const displayDataChanges = [
            this._ecommerceProductService.onProductsChanged,
            this._matPaginator.page,
            this._filterChange,
            this._matSort.sortChange
        ];

        return merge(...displayDataChanges)
            .pipe(
                map(() => {
                    // let data = [];
                    let data = this._ecommerceProductService.products.slice();

                    data = this.filterData(data);

                    this.filteredData = [...data];

                    data = this.sortData(data);

                    // Grab the page's slice of data.
                    const startIndex = this._matPaginator.pageIndex * this._matPaginator.pageSize;
                    return data.splice(startIndex, this._matPaginator.pageSize);
                }
                ));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Filtered data
    get filteredData(): any {
        return this._filteredDataChange.value;
    }

    set filteredData(value: any) {
        this._filteredDataChange.next(value);
    }

    // Filter
    get filter(): string {
        return this._filterChange.value;
    }

    set filter(filter: string) {
        this._filterChange.next(filter);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter data
     *
     * @param data
     * @returns {any}
     */
    filterData(data): any {
        if (!this.filter) {
            return data;
        }
        return FuseUtils.filterArrayByString(data, this.filter);
    }

    /**
     * Sort data
     *
     * @param data
     * @returns {any[]}
     */
    sortData(data): any[] {
        if (!this._matSort.active || this._matSort.direction === '') {
            return data;
        }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch (this._matSort.active) {
                case 'prod_id':
                    [propertyA, propertyB] = [a.prod_id, b.prod_id];
                    break;
                case 'prod_nombre':
                    [propertyA, propertyB] = [a.prod_nombre, b.prod_nombre];
                    break;
                case 'prod_categoria':
                    [propertyA, propertyB] = [a.prod_categoria, b.prod_categoria];
                    break;
                // case 'prod_precio_dia':
                //     [propertyA, propertyB] = [a.prod_precio_dia, b.prod_precio_dia];
                //     break;
                case 'prod_est_alquiler':
                    [propertyA, propertyB] = [a.prod_est_alquiler, b.prod_est_alquiler];
                    break;
                case 'prod_est_registro':
                    [propertyA, propertyB] = [a.prod_est_registro, b.prod_est_registro];
                    break;
            }
            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this._matSort.direction === 'asc' ? 1 : -1);
        });
    }

    /**
     * Disconnect
     */
    disconnect(): void {
    }
}
