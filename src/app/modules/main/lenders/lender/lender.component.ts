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
import { Lender } from '../../../../models/lender.model';
import * as base64Converter from 'base64-arraybuffer';
import { ImageViewComponent } from './imageViewer/imageview.component';
import { LenderService } from '../../../../services/lender.service';
import { ImageUploadComponent } from './imageUpload/image-upload.component';

@Component({
    selector     : 'lender-app',
    templateUrl  : './lender.component.html',
    styleUrls    : ['./lender.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class LenderComponent implements OnInit, OnDestroy
{
    lender: Lender;
    pageType: string;
    lenderForm: FormGroup;
    listadoDistritosLima = [];
    fileToUpload: File = null;
    listImagesUpload = [];
    listadoTiposDocumento = [
        {
            tip_docum_id: '1',
            tip_docum_nom: 'Documento Nacional de Identidad (DNI)'
        }
    ];
    listImages = [];
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
        private _lenderService: LenderService,
        private _formBuilder: FormBuilder,
        private _location: Location,
        private _matSnackBar: MatSnackBar,        
        private registroUtil: RegistroUtil,
        private securityService: SecurityService,
        private router: Router,
        public  dialog: MatDialog,
    )
    {
        // Set the default
        this.lender = new Lender();

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
                    this.lender = new Lender(lender);
                    this.pageType = 'edit';
                    this.cargarDocumentos(this.lender.lndr_url_documen);
                }
                else
                {
                    this.pageType = 'new';
                    this.lender = new Lender();
                }
                this.lenderForm = this.createLenderForm();
            });
    }

    cargarDistritosLima(): void {
        this.listadoDistritosLima = this._lenderService.cargarDistritosLima();
    }

    cargarDocumentos(documents): void {
        documents.forEach(element => {
            this._lenderService.getImageS3(element.image_key).subscribe(
                data => {
                    const image = {
                        data: base64Converter.encode(data.data_result.Body.data),
                        desc: element
                    };
                    this.listImages.push(image);
                }
            );
        });
    }

    handleFileInput(event): void {
        const files = event.target.files;
        const file = files[0];
      if (files && file) {
          const reader = new FileReader();
          reader.onload = this._handleReaderLoaded.bind(this);
          reader.readAsBinaryString(file);
      }      
    }

    _handleReaderLoaded(readerEvt): void {
        const binaryString = readerEvt.target.result;
        const dataUpload = {
            imageEncodeBase64 : btoa(binaryString)            
        };
        const image = {
            data: dataUpload.imageEncodeBase64,
            desc: {
                image_desc: 'Hola Mundo'
            }
        };
        this.listImages.push(image);
        this.listImagesUpload.push(dataUpload);
        console.log(this.listImagesUpload);
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
            lndr_id             : [this.lender.lndr_id],            
            lndr_nombres        : [this.lender.lndr_nombres],
            lndr_ape_paterno    : [this.lender.lndr_ape_paterno],
            lndr_ape_materno    : [this.lender.lndr_ape_materno],
            lndr_email          : [this.lender.lndr_email],
            lndr_slug           : [this.lender.lndr_slug],
            lndr_num_celular    : [this.lender.lndr_num_celular],
            lndr_num_documen    : [this.lender.lndr_num_documen],
            tip_docum_id        : [this.lender.lndr_tip_documen.tip_docum_id],
            lndr_ubigeo_dpt     : [this.lender.lndr_ubigeo.ubig_dpt],
            lndr_ubigeo_prv     : [this.lender.lndr_ubigeo.ubig_prv],
            lndr_ubigeo_dst_id  : [this.lender.lndr_ubigeo.ubig_id.substr(4, 2)],
            lndr_est_registro   : [this.lender.lndr_est_registro],
            lndr_fec_registro   : [this.lender.lndr_fec_registro],
            lndr_usu_registro   : [this.lender.lndr_usu_registro],
            lndr_fec_actualiza  : [this.lender.lndr_fec_actualiza],
            lndr_usu_actualiza  : [this.lender.lndr_usu_actualiza],
        });
    }

    /**
     * Save Lender
     */
    saveProduct(): void
    {
        const LenderSave: Lender = new Lender();
        LenderSave.lndr_id = this.lender.lndr_id;
        LenderSave.lndr_nombres = this.lenderForm.value.lndr_nombres;
        LenderSave.lndr_ape_materno = this.lenderForm.value.lndr_ape_materno;
        LenderSave.lndr_ape_paterno = this.lenderForm.value.lndr_ape_paterno;
        LenderSave.lndr_num_documen = this.lenderForm.value.lndr_num_documen;
        LenderSave.lndr_tip_documen = this.obtenerTipoDocumSeleccionado();
        LenderSave.lndr_num_celular = this.lenderForm.value.lndr_num_celular;
        LenderSave.lndr_email = this.lenderForm.value.lndr_email;
        LenderSave.lndr_ubigeo = this.obtenerUbigeoDistrito();
        LenderSave.lndr_fec_actualiza = this.registroUtil.obtenerFechaCreacion();
        LenderSave.lndr_usu_actualiza = this.securityService.getUserLogedId();
        this._lenderService.updateLender(LenderSave).subscribe(
            data => {
                this._matSnackBar.open('Prestamista actualizado', 'Aceptar', {
                    verticalPosition: 'top',
                    duration: 3000
                });                
            }
        );
    }

    obtenerTipoDocumSeleccionado(): any {
        return this.listadoTiposDocumento.find(x => x.tip_docum_id === this.lenderForm.value.tip_docum_id);
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
    addProduct(): void
    {
        const LenderSave: Lender = new Lender();        
        LenderSave.lndr_nombres = this.lenderForm.value.lndr_nombres;
        LenderSave.lndr_ape_materno = this.lenderForm.value.lndr_ape_materno;
        LenderSave.lndr_ape_paterno = this.lenderForm.value.lndr_ape_paterno;
        LenderSave.lndr_slug = this.registroUtil.obtenerSlugPorNombre(LenderSave.lndr_nombres + ' ' + LenderSave.lndr_ape_paterno);
        LenderSave.lndr_num_documen = this.lenderForm.value.lndr_num_documen;
        LenderSave.lndr_tip_documen = this.obtenerTipoDocumSeleccionado();
        LenderSave.lndr_num_celular = this.lenderForm.value.lndr_num_celular;
        LenderSave.lndr_email = this.lenderForm.value.lndr_email;
        LenderSave.lndr_ubigeo = this.obtenerUbigeoDistrito();
        LenderSave.lndr_fec_registro = this.registroUtil.obtenerFechaCreacion();
        LenderSave.lndr_usu_registro = this.securityService.getUserLogedId();

        LenderSave.lndr_url_documen = [
            {
                image_key: 'mark_lilly_by_xneetoh-d4lucn4.jpg',
                image_desc: 'Copia DNI'
            },
            {
                image_key: 'mark_lilly_by_xneetoh-d4lucn4.jpg',
                image_desc: 'Copia Recivo de agua'
            }
        ];

        this._lenderService.createLender(LenderSave).subscribe(
            data => {
                this._matSnackBar.open('Prestamista registrado', 'Aceptar', {
                    verticalPosition: 'top',
                    duration: 3000
                });
                this.router.navigateByUrl('/lenders');
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
            console.log(result);        
        });
    }
}
