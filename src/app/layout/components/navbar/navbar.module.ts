import { NgModule } from '@angular/core';

import { FuseSharedModule } from '@fuse/shared.module';

import { NavbarComponent } from 'app/layout/components/navbar/navbar.component';
import { NavbarVerticalModule } from './vertical/nav.module';

@NgModule({
    declarations: [
        NavbarComponent
    ],
    imports     : [
        FuseSharedModule,

        NavbarVerticalModule,
    ],
    exports     : [
        NavbarComponent
    ]
})
export class NavbarModule
{
}
