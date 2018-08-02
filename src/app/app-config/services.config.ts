import { Injectable } from '@angular/core';

@Injectable()
export class ServicesConfig {

    private ServerUrl = 'https://pqcnj1fxjj.execute-api.us-east-1.amazonaws.com/Desarrollo';

    private publishUrl = 'https://www.circular.pe/';

    urlAuthUser(): string {
        return this.ServerUrl;
    }

    urlPayment(): string {
        return this.ServerUrl + '/payment';
    }

    currentUrl(): string {
        return this.publishUrl;
    }
}
