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

import { LenderComponent } from './lender/lender.component';
import { LendersComponent } from './lenders-list/lenders.component';
import { ImageViewComponent } from './lender/imageViewer/imageview.component';
import { ImageViewModule } from './lender/imageViewer/imageview.module';
import { LendersService } from '../../../services/lenders.service';
import { LenderService } from '../../../services/lender.service';
import { ImageUploadComponent } from './lender/imageUpload/image-upload.component';
import { ImageUploadModule } from './lender/imageUpload/image-upload.module';


const routes: Routes = [
    {
        path: '',
        component: LendersComponent,
        resolve: {
            data: LendersService
        }
    },
    {
        path: 'lender/:id/:handle',
        component: LenderComponent,
        resolve: {
            data: LenderService
        }
    },
    {
        path: 'lender/:id',
        component: LenderComponent,
        resolve: {
            data: LenderService
        }
    },
];

@NgModule({
    declarations: [
        LenderComponent,
        LendersComponent        
    ],
    entryComponents: [
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

        MatDialogModule,

        NgxChartsModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyD81ecsCj4yYpcXSLFcYU97PvRsE_X8Bx8'
        }),

        FuseSharedModule,
        FuseWidgetModule,
        ImageViewModule,
        ImageUploadModule
    ],
    providers: [
        LendersService,
        LenderService,
    ]
})
export class LenderModule {
}
