import { Injectable } from '@angular/core';

@Injectable()
export class ServicesConfig {

    private publishUrl = 'https://www.circular.pe/';

    urlAuthUser(): string {
        return 'https://lnyep59mb1.execute-api.us-east-1.amazonaws.com/dev';
    }

    urlProducts(): string {
        return 'https://mofy4cwezf.execute-api.us-east-1.amazonaws.com/dev';
    }

    urlCategorys(): string {
        return 'https://58b0ltmaxd.execute-api.us-east-1.amazonaws.com/Desarrollo';
    }

    urlUsers(): string {
        return 'https://pqcnj1fxjj.execute-api.us-east-1.amazonaws.com/dev';
    }

    urlS3(): string {
        return 'https://h7g83v5yj7.execute-api.us-east-1.amazonaws.com/dev';
    }

    urlPayments(): string {
        return 'https://dunjvv0pid.execute-api.us-east-1.amazonaws.com/dev';
    }

    urlRents(): string {
        return 'https://92z92up3de.execute-api.us-east-1.amazonaws.com/dev';
    }

    currentUrl(): string {
        return this.publishUrl;
    }
}
