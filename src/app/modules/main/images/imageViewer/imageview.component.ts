import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'image-view-app',
    templateUrl: 'imageview.component.html',
    styleUrls: ['./imageview.component.scss']
})
export class ImageViewComponent implements OnInit {
    public image: any;
    constructor(
        public dialogRef: MatDialogRef<ImageViewComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {        
        this.image = data;        
    }

    ngOnInit(): void{

    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
