import { Injectable } from '@angular/core';

@Injectable()
export class PaymentChargeModel {
    amount: string;
    currency_code: string;
    email: string;
    antifraud_details: {
        address: string;
        address_city: string;
        country_code: string;
        first_name: string;
        last_name: string;
        phone_number: string;
    };
    source_id: string;
}
