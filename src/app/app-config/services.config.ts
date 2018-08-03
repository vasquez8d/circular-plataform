import { Injectable } from '@angular/core';

@Injectable()
export class ServicesConfig {

    private publishUrl = 'https://www.circular.pe/';

    urlAuthUser(): string {
        return 'https://pqcnj1fxjj.execute-api.us-east-1.amazonaws.com/Desarrollo';
    }

    urlProducts(): string {
        return 'https://mofy4cwezf.execute-api.us-east-1.amazonaws.com/Desarrollo';
    }

    currentUrl(): string {
        return this.publishUrl;
    }
}
