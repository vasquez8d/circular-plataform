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
    }
    checkStatusButton(): void {
        if (this.image_desc !== ''){
            this.saveDocumentStatus = true;
        }
    }

    addDocument(): void {

    }
}
