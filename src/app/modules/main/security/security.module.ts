import { NgModule } from '@angular/core';

import { Login2Module } from 'app/modules/main/security/login/login.module';

@NgModule({
    imports: [
        // Authentication
        Login2Module,
    ]
})
export class SecurityModule
{

}
