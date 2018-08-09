import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule, MatChipsModule, MatFormFieldModule, 
         MatIconModule, MatInputModule, MatPaginatorModule, 
         MatRippleModule, MatSelectModule, MatSnackBarModule, 
         MatSortModule, MatTableModule, MatTabsModule, MatDialogModule } from '@angular/material';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AgmCoreModule } from '@agm/core';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { EcommerceProductsComponent } from './products-list/products.component';
import { EcommerceProductsService } from '../../../services/products.service';
import { EcommerceProductService } from '../../../services/product.service';
import { EcommerceProductComponent } from './product/product.component';
import { ImageUploadComponent } from '../images/imageUpload/image-upload.component';
import { ImageViewComponent } from '../images/imageViewer/imageview.component';
import { ImageUploadModule } from '../images/imageUpload/image-upload.module';
import { ImageViewModule } from '../images/imageViewer/imageview.module';


const routes: Routes = [
    {
        path: '',
        component: EcommerceProductsComponent,
        resolve: {
            data: EcommerceProductsService
        }
    },
    {
        path: 'product/:id/:handle',
        component: EcommerceProductComponent,
        resolve: {
            data: EcommerceProductService
        }
    },
    {
        path: 'product/:id',
        component: EcommerceProductComponent,
        resolve: {
            data: EcommerceProductService
        }
    },
];

@NgModule({
    declarations: [
        EcommerceProductsComponent,
        EcommerceProductComponent,
    ],
    entryComponents : [
        ImageViewComponent,
        ImageUploadComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatRippleModule,
        MatSelectModule,
        MatSortModule,
        MatSnackBarModule,
        MatTableModule,
        MatTabsModule,

        NgxChartsModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyD81ecsCj4yYpcXSLFcYU97PvRsE_X8Bx8'
        }),

        FuseSharedModule,
        FuseWidgetModule,

        MatDialogModule,

        ImageViewModule,
        ImageUploadModule
    ],
    providers: [
        EcommerceProductsService,
        EcommerceProductService,
    ]
})
export class ProductsModule {
}
