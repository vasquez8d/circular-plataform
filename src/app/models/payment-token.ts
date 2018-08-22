import { Injectable } from '@angular/core';

@Injectable()
export class PaymentTokenModel {
    card_number: string;
    cvv: string;
    expiration_month: string;
    expiration_year: string;
    email: string;
}
