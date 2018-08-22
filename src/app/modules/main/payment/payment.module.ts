import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeComponent } from './resume/resume.component';
import { FuseSharedModule } from '@fuse/shared.module';
import { RouterModule } from '@angular/router';
import { MatStepperModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule } from '@angular/material';
import { ScriptHackModule } from '../../../utils/script-hack/script-hack.module';

const routes = [
  {
    path: 'resumen',
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

    ScriptHackModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ResumeComponent]
})
export class PaymentModule { }
