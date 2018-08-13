import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule, MatChipsModule, MatFormFieldModule, 
         MatIconModule, MatInputModule, MatPaginatorModule, 
         MatRippleModule, MatSelectModule, MatSnackBarModule, 
         MatSortModule, MatTableModule, MatTabsModule, MatDialogModule, 
         MatSlideToggleModule, MatCardModule, MatTooltipModule, 
         MatSliderModule, 
         MatDatepickerModule} from '@angular/material';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { EcommerceProductsService } from '../../../services/products.service';
import { EcommerceProductService } from '../../../services/product.service';
import { UserService } from '../../../services/user.service';
import { LenderProductsService } from '../../../services/productsxlender.service';
import { RentsComponent } from './rents/rents.component';
import { RentalComponent } from './rental/rental.component';
import { BorrowerRentsComponent } from './borrower/borrower-rents.component';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';

const routes: Routes = [
    {
        path: '',
        component: RentsComponent,
        resolve: {
            data: EcommerceProductsService
        }
    },
    {
        path: 'rental/:id/:handle/:user_id',
        component: RentalComponent,
        resolve: {
            data: EcommerceProductService
        }
    },
    {
        path: 'rental/:id/:handle',
        component: RentalComponent,
        resolve: {
            data: EcommerceProductService
        }
    },
    {
        path: 'rental/:id',
        component: RentalComponent,
        resolve: {
            data: EcommerceProductService
        }
    },
    {
        path: 'borrower/:id/:handle',
        component: BorrowerRentsComponent,
        resolve: {
            data: LenderProductsService
        }
    }
];

@NgModule({
    declarations: [
        RentalComponent,
        RentsComponent,
        BorrowerRentsComponent
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
        MatSliderModule,
        MatCardModule,
        MatTooltipModule,

        NgxChartsModule,

        FuseSharedModule,
        FuseWidgetModule,


        SatDatepickerModule,
        SatNativeDateModule,
        MatDatepickerModule,

        MatDialogModule
    ],
    providers: [
        EcommerceProductsService,
        EcommerceProductService,
        UserService,
        LenderProductsService
    ]
})
export class RentsModule {
}
