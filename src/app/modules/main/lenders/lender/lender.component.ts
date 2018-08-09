import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { SecurityService } from '../../../../services/security.service';
import { RegistroUtil } from '../../../../utils/registro.util';
import { Router } from '../../../../../../node_modules/@angular/router';
import * as base64Converter from 'base64-arraybuffer';
import { UserModel } from '../../../../models/user.model';
import { UserService } from '../../../../services/user.service';
import { ImageUploadComponent } from '../../images/imageUpload/image-upload.component';
import { ImageViewComponent } from '../../images/imageViewer/imageview.component';
import { S3Service } from '../../../../services/s3.service';
import { AppCategoryConfig } from '../../../../app-config/app-categorys.config';

@Component({
    selector     : 'lender-app',
    templateUrl  : './lender.component.html',
    styleUrls    : ['./lender.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class LenderComponent implements OnInit, OnDestroy
{
    lender: UserModel;
    pageType: string;
    lenderForm: FormGroup;
    listadoDistritosLima = [];
    fileToUpload: File = null;

    public imageUploaded = true;

    listImagesUpload = [];
    listadoTiposDocumento = [
        {
            tip_docum_id: '1',
            tip_docum_nom: 'Documento Nacional de Identidad (DNI)'
        }
    ];
    listImages = [];
    listImagesGuardar = [];
    listCurrentImages = [];
    bNewImages = false;
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {LenderService} _lenderService
     * @param {FormBuilder} _formBuilder
     * @param {Location} _location
     * @param {MatSnackBar} _matSnackBar
     */
    constructor(
        private _lenderService: UserService,
        private _s3Service: S3Service,
        private _formBuilder: FormBuilder,
        private _location: Location,
        private _matSnackBar: MatSnackBar,        
        private registroUtil: RegistroUtil,
        private securityService: SecurityService,
        private router: Router,
        public  dialog: MatDialog,
        private appCategoryConfig: AppCategoryConfig
    )
    {
        // Set the default
        this.lender = new UserModel();

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
        this.cargarDistritosLima();
        // Subscribe to update product on changes
        this._lenderService.onProductChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(lender => {
                if ( lender )
                {
                    this.lender = new UserModel(lender);
                    this.pageType = 'edit';
                    this.cargarDocumentos(this.lender.user_url_documen);
                }
                else
                {
                    this.pageType = 'new';
                    this.lender = new UserModel();
                }
                this.lenderForm = this.createLenderForm();
            });
    }

    cargarDistritosLima(): void {
        this.listadoDistritosLima = this._lenderService.cargarDistritosLima();
    }

    cargarDocumentos(documents): void {
        documents.forEach(element => {
            const datas3Body = {
                app_key: element.image_key,
                app_catg_id: this.appCategoryConfig.getLenderCategory()
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
    createLenderForm(): FormGroup
    {  
        return this._formBuilder.group({
            user_id             : [this.lender.user_id],            
            user_names          : [this.lender.user_names],
            user_full_name1     : [this.lender.user_full_name1],
            user_full_name2     : [this.lender.user_full_name2],
            user_email          : [this.lender.user_email],            
            user_num_phone      : [this.lender.user_num_phone],
            user_num_doc        : [this.lender.user_num_doc],
            user_tip_doc        : [this.lender.user_tip_doc.tip_docum_id],
            lndr_ubigeo_dpt     : [this.lender.user_ubigeo.ubig_dpt],
            lndr_ubigeo_prv     : [this.lender.user_ubigeo.ubig_prv],
            lndr_ubigeo_dst_id  : [this.lender.user_ubigeo.ubig_id.substr(4, 2)],
            user_stat_reg       : [this.lender.user_stat_reg],
            user_date_reg       : [this.lender.user_date_reg],
            user_usur_reg       : [this.lender.user_usur_reg],
            user_date_upt       : [this.lender.user_date_upt],
            user_usur_upt       : [this.lender.user_usur_upt],
        });
    }

    /**
     * Save Lender
     */
    saveLender(): void
    {
        const LenderSave: UserModel = new UserModel();
        LenderSave.user_id = this.lender.user_id;
        LenderSave.user_names = this.lenderForm.value.user_names;
        LenderSave.user_full_name1 = this.lenderForm.value.user_full_name1;
        LenderSave.user_full_name2 = this.lenderForm.value.user_full_name2;
        LenderSave.user_slug = this.registroUtil.obtenerSlugPorNombre(LenderSave.user_names + ' ' + LenderSave.user_full_name1);
        LenderSave.user_num_doc = this.lenderForm.value.user_num_doc;
        LenderSave.user_tip_doc = this.obtenerTipoDocumSeleccionado();
        LenderSave.user_num_phone = this.lenderForm.value.user_num_phone;
        LenderSave.user_email = this.lenderForm.value.user_email;
        LenderSave.user_ubigeo = this.obtenerUbigeoDistrito();
        LenderSave.user_date_upt = this.registroUtil.obtenerFechaCreacion();
        LenderSave.user_usur_upt = this.securityService.getUserLogedId();
        LenderSave.user_categ = {
            catg_id: this.appCategoryConfig.getLenderCategory()
        };

        this._lenderService.updateLender(LenderSave).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    this._matSnackBar.open('Prestamista actualizado', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000
                    }); 

                    if (this.bNewImages) {
                        const listImagesGuardar = [];
                        // tslint:disable-next-line:typedef
                        this.listImages.forEach(function (element, index, theArray){
                            const dataUpload = {
                                imageString64: element.data,
                                app_id: this.lender.user_id,
                                app_categ_id: this.appCategoryConfig.getLenderCategory()                        
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
                                            app_id: this.lender.user_id,
                                            app_url_documen: listImagesGuardar,
                                            app_categ: this.appCategoryConfig.getLenderCategory()
                                        };
                                        theArray[index] = {
                                            data: element.data,
                                            desc: {
                                                image_key : responseUpload.data_result.fileName,
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

    obtenerTipoDocumSeleccionado(): any {
        return this.listadoTiposDocumento.find(x => x.tip_docum_id === this.lenderForm.value.user_tip_doc);
    }

    obtenerUbigeoDistrito(): any {
        return {
            ubig_dpt: 'Lima',
            ubig_prv: 'Lima',
            ubig_dst: this.listadoDistritosLima.find(x => x.dst_id === this.lenderForm.value.lndr_ubigeo_dst_id).dst_nombre,
            ubig_id: '1501' + this.listadoDistritosLima.find(x => x.dst_id === this.lenderForm.value.lndr_ubigeo_dst_id).dst_id
        };
    }

    /**
     * Add product
     */
    addLender(): void
    {

        const LenderSave: UserModel = new UserModel();        
        LenderSave.user_names = this.lenderForm.value.user_names;
        LenderSave.user_full_name1 = this.lenderForm.value.user_full_name1;
        LenderSave.user_full_name2 = this.lenderForm.value.user_full_name2;
        LenderSave.user_slug = this.registroUtil.obtenerSlugPorNombre(LenderSave.user_names + ' ' + LenderSave.user_full_name1);
        LenderSave.user_num_doc = this.lenderForm.value.user_num_doc;
        LenderSave.user_tip_doc = this.obtenerTipoDocumSeleccionado();
        LenderSave.user_num_phone = this.lenderForm.value.user_num_phone;
        LenderSave.user_email = this.lenderForm.value.user_email;
        LenderSave.user_ubigeo = this.obtenerUbigeoDistrito();
        LenderSave.user_date_reg = this.registroUtil.obtenerFechaCreacion();
        LenderSave.user_usur_reg = this.securityService.getUserLogedId();
        LenderSave.user_categ = {
            catg_id: this.appCategoryConfig.getLenderCategory(),
            catg_name: 'Lender'  
        };        
        this._lenderService.createLender(LenderSave).subscribe(
            data => {                
                if (data.res_service === 'ok') {
                    this._matSnackBar.open('Prestamista modificado', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 5000
                    });
                    const listImagesGuardar = [];
                    this.listImages.forEach(element => {
                        const dataUpload = {
                            imageString64: element.data,
                            app_id: data.data_result.user_id,
                            app_categ_id: this.appCategoryConfig.getLenderCategory()                             
                        };
                        this._s3Service.uploadImageS3(dataUpload).subscribe(
                            responseUpload => {                                                               
                                const data_image = {
                                    image_key: responseUpload.data_result.fileName,
                                    image_desc: element.desc.image_desc
                                };
                                listImagesGuardar.push(data_image);
                                const dataUploadFileName = {
                                    app_id: data.data_result.user_id,
                                    app_url_documen: listImagesGuardar,
                                    app_categ: this.appCategoryConfig.getLenderCategory()
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
                    
                    this.router.navigateByUrl('/lenders');
                } else {
                    this._matSnackBar.open('Error modificando la información del prestamista', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000,
                        panelClass: 'mat-error-dialog'
                    });
                }
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
            if (result){
                const image = {
                    data: result.data_image,
                    desc: {
                        image_desc: result.data_desc
                    }
                };
                this.listImages.push(image);
                this.imageUploaded = false;    
                try {
                  (<HTMLInputElement> document.getElementById('btnSaveLender')).disabled = false;
                } catch (e) {}                     
                
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
            duration: 5000
        });
    }
}
