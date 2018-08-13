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
import { LoginGuard } from './guards/login.guard';
import { AppCategoryConfig } from './app-config/app-categorys.config';
import { LogoutGuard } from './guards/logout.guard';

const appRoutes: Routes = [
    {
        path        : 'security',
        canActivate : [LogoutGuard],
        loadChildren: './modules/main/security/security.module#SecurityModule'
    },
    {
        path        : 'products',
        canActivate : [LoginGuard],
        loadChildren: './modules/main/products/products.module#ProductsModule'
    }, 
    {
        path        : 'lenders',
        canActivate : [LoginGuard],
        loadChildren: './modules/main/lenders/lenders.module#LenderModule'
    },
    {
        path        : 'borrowers',
        canActivate : [LoginGuard],
        loadChildren: './modules/main/borrowers/borrowers.module#BorrowerModule'
    },
    {
        path        : 'rents',
        canActivate : [LoginGuard],
        loadChildren: './modules/main/rents/rents.module#RentsModule'
    },          
    {
        path        : '**',
        canActivate : [LoginGuard],
        redirectTo  : 'lenders'
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
    providers: [ServicesConfig, LoginGuard, AppCategoryConfig, LogoutGuard]
})
export class AppModule
{
}
