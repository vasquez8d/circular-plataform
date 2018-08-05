import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import 'hammerjs';

import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';

import { fuseConfig } from './fuse-config';

import { AppComponent } from './app.component';
import { LayoutModule } from './modules/layout/layout.module';
import { ServicesConfig } from './app-config/services.config';
import { InMemoryWebApiModule } from '../../node_modules/angular-in-memory-web-api';
import { FakeDbService } from './fake-db/fake-db.service';
import { LoginGuard } from './guards/login.guard';

const appRoutes: Routes = [
    {
        path        : 'security',
        loadChildren: './modules/main/security/security.module#SecurityModule'
    },
    {
        path        : 'products',
        canActivate : [LoginGuard],
        loadChildren: './modules/main/products/products.module#ProductsModule'
    },    
    {
        path        : '**',
        loadChildren: './modules/main/security/security.module#SecurityModule'
    }
];

@NgModule({
    declarations: [
        AppComponent
    ],
    imports     : [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes),

        TranslateModule.forRoot(),
        InMemoryWebApiModule.forRoot(FakeDbService, {
            delay: 0,
            passThruUnknownUrl: true
        }),
        // Material moment date module
        MatMomentDateModule,

        // Material
        MatButtonModule,
        MatIconModule,

        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,

        // App modules
        LayoutModule
    ],
    bootstrap   : [
        AppComponent
    ],
    providers: [ServicesConfig, LoginGuard]
})
export class AppModule
{
}
