import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule, MatChipsModule, MatFormFieldModule, 
         MatIconModule, MatInputModule, MatPaginatorModule, 
         MatRippleModule, MatSelectModule, MatSnackBarModule, 
         MatSortModule, MatTableModule, MatTabsModule, MatDialogModule, MatSlideToggleModule, MatCardModule, 
         MatTooltipModule, MatDatepickerModule } from '@angular/material';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';

import { UserService } from '../../../services/user.service';
import { ImageViewComponent } from '../images/imageViewer/imageview.component';
import { ImageUploadComponent } from '../images/imageUpload/image-upload.component';
import { ImageViewModule } from '../images/imageViewer/imageview.module';
import { ImageUploadModule } from '../images/imageUpload/image-upload.module';
import { BorrowersComponent } from './lenders-list/borrowers.component';
import { BorrowerComponent } from './borrower/borrower.component';
import { BorrowersService } from '../../../services/borrowers.service';

const routes: Routes = [
    {
        path: '',
        component: BorrowersComponent,
        resolve: {
            data: BorrowersService
        }
    },
    {
        path: 'borrower/:id/:handle',
        component: BorrowerComponent,
        resolve: {
            data: UserService
        }
    },
    {
        path: 'borrower/:id',
        component: BorrowerComponent,
        resolve: {
            data: UserService
        }
    },
];

@NgModule({
    declarations: [
        BorrowerComponent,
        BorrowersComponent        
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
        MatSlideToggleModule,
        MatCardModule,
        MatDialogModule,
        MatTooltipModule,
        MatDatepickerModule,
        NgxChartsModule,

        FuseSharedModule,
        FuseWidgetModule,
        ImageViewModule,
        ImageUploadModule        
    ],
    providers: [
        BorrowersService,
        UserService,
    ]
})
export class BorrowerModule {
}
