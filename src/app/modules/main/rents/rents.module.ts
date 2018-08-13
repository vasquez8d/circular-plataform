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
import { UserService } from '../../../services/user.service';
import { LenderProductsService } from '../../../services/productsxlender.service';
import { RentsComponent } from './rents/rents.component';
import { RentalComponent } from './rental/rental.component';
import { BorrowerRentsComponent } from './borrower/borrower-rents.component';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { RentsService } from '../../../services/rents.service';
import { RentalService } from '../../../services/rental.service';
import { EcommerceProductService } from '../../../services/product.service';

const routes: Routes = [
    {
        path: '',
        component: RentsComponent,
        resolve: {
            data: RentsService
        }
    },
    {
        path: 'rental/:id/:handle/:user_id',
        component: RentalComponent,
        resolve: {
            data: RentalService
        }
    },
    {
        path: 'rental/:id/:handle',
        component: RentalComponent,
        resolve: {
            data: RentalService
        }
    },
    {
        path: 'rental/:id',
        component: RentalComponent,
        resolve: {
            data: RentalService
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
        RentalService,
        RentsService,
        UserService,
        LenderProductsService,
        EcommerceProductService
    ]
})
export class RentsModule {
}
