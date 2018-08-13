import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'image-upload-app',
    templateUrl: 'image-upload.component.html',
    styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {
    public image: any;
    public saveDocumentStatus = false;
    public image_desc = '';
    constructor(
        public dialogRef: MatDialogRef<ImageUploadComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {        
        this.image = data;        
    }

    ngOnInit(): void{

    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    handleFileInput(event): void {        
        const files = event.target.files;
        const file = files[0];        
      if (files && file) {
          const reader = new FileReader();
          reader.onload = this._handleReaderLoaded.bind(this);
          reader.readAsBinaryString(file);
          (<HTMLInputElement>document.getElementById('txtFileName')).value = file.name;
      }      
    }

    _handleReaderLoaded(readerEvt): void {
        const binaryString = readerEvt.target.result;
        const dataUpload = {
            imageEncodeBase64 : btoa(binaryString)            
        };
        const image = {
            data: dataUpload.imageEncodeBase64,
        };
        this.image.data_image = image.data;
        this.checkStatusButton();
    }
    checkStatusButton(): void {
        const fileName = (<HTMLInputElement>document.getElementById('txtFileName')).value;
        const fileDesc = (<HTMLInputElement>document.getElementById('txtDescImage')).value;
        if (fileName !== '' && fileName != null && fileDesc !== '' && fileDesc != null){
            this.saveDocumentStatus = true;
            this.image_desc = fileDesc;
        }else{
            this.saveDocumentStatus = false;
        }
    }

    checkStatusButtonKeypress(event): void {
        if (event.key === 'Enter') {
            if (this.saveDocumentStatus) {
                this.addDocument();
            }
        } else {
            const fileName = (<HTMLInputElement>document.getElementById('txtFileName')).value;
            const fileDesc = (<HTMLInputElement>document.getElementById('txtDescImage')).value;
            if (fileName !== '' && fileName != null && fileDesc !== '' && fileDesc != null){
                this.saveDocumentStatus = true;
                this.image_desc = fileDesc;
            }else{
                this.saveDocumentStatus = false;
            }
        }
    }

    addDocument(): void {
        const data_return = {
            data_image: this.image.data_image,
            data_desc: this.image_desc
        };
        this.dialogRef.close(data_return);
    }
}
