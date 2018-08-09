import { Injectable } from '@angular/core';

@Injectable()
export class AppCategoryConfig {

    getAdminCategory(): string {
        return '1';
    }

    getLenderCategory(): string {
        return '2';
    }

    getBorrowerCategory(): string {
        return '3';
    }

    getProductCategory(): string {
        return '4';
    }

}
