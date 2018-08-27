import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeComponent } from './resume/resume.component';
import { FuseSharedModule } from '@fuse/shared.module';
import { RouterModule } from '@angular/router';
import { MatStepperModule, MatFormFieldModule, MatInputModule, MatButtonModule, 
         MatIconModule, MatSnackBarModule, MatCardModule, MatExpansionModule } from '@angular/material';
import { ScriptHackModule } from '../../../utils/script-hack/script-hack.module';
import { LoadingModule } from 'ngx-loading';
import { PaymentService } from '../../../services/payment.service';
import { RentalService } from '../../../services/rental.service';

const routes = [
  {
    path: ':rent_id/secured',
    component: ResumeComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FuseSharedModule,

    MatStepperModule,
    MatFormFieldModule,    
    MatInputModule,    
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    
    MatExpansionModule,

    LoadingModule,
    MatCardModule,
    ScriptHackModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ResumeComponent],
  providers: [ 
    PaymentService
  ]
})
export class PaymentModule { }
