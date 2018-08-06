import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule, MatChipsModule, MatFormFieldModule, 
         MatIconModule, MatInputModule, MatPaginatorModule, 
         MatRippleModule, MatSelectModule, MatSnackBarModule, 
         MatSortModule, MatTableModule, MatTabsModule } from '@angular/material';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AgmCoreModule } from '@agm/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { EcommerceProductsService } from '../../../services/products.service';
import { EcommerceProductService } from '../../../services/product.service';
import { BorrowersComponent } from './borrowers-list/borrowers.component';
import { BorrowerComponent } from './borrower/borrower.component';


const routes: Routes = [
    {
        path: '',
        component: BorrowersComponent,
        resolve: {
            data: EcommerceProductsService
        }
    },
    {
        path: 'product/:id/:handle',
        component: BorrowerComponent,
        resolve: {
            data: EcommerceProductService
        }
    },
    {
        path: 'product/:id',
        component: BorrowerComponent,
        resolve: {
            data: EcommerceProductService
        }
    },
];

@NgModule({
    declarations: [
        BorrowerComponent,
        BorrowersComponent,
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
    ],
    providers: [
        EcommerceProductsService,
        EcommerceProductService,
    ]
})
export class BorrowerModule {
}
