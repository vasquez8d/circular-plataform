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
import { UsersService } from '../../../services/users.service';
import { UserService } from '../../../services/user.service';
import { ImageViewComponent } from '../images/imageViewer/imageview.component';
import { ImageUploadComponent } from '../images/imageUpload/image-upload.component';
import { ImageViewModule } from '../images/imageViewer/imageview.module';
import { ImageUploadModule } from '../images/imageUpload/image-upload.module';


const routes: Routes = [
    {
        path: '',
        component: LendersComponent,
        resolve: {
            data: UsersService
        }
    },
    {
        path: 'lender/:id/:handle',
        component: LenderComponent,
        resolve: {
            data: UserService
        }
    },
    {
        path: 'lender/:id',
        component: LenderComponent,
        resolve: {
            data: UserService
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
        UsersService,
        UserService,
    ]
})
export class LenderModule {
}
