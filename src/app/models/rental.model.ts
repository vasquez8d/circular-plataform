import { Injectable } from '@angular/core';

@Injectable()
export class RentalModel {
    rent_id: any;
    rent_borrow_id: any;
    rent_prod_id: any;
    
    rent_range_date: {
        rent_start: any;
        rent_end: any;
    };

    rent_start_address_rec: string;
    rent_start_address_rec_ref: string;
    rent_start_time_range_rec: {
        min_range: string;
        max_range: string;
        range_id: number;
    };
    
    
    rent_end_address_rec: string;
    rent_end_address_rec_ref: string;
    rent_end_time_range_rec: {
        min_range: string;
        max_range: string;
        range_id: number;
    };
    
    rent_status: any;
    rent_stat_reg: any;
    
    rent_date_reg: any;
    rent_usur_reg: any;

    rent_date_upt: any;
    rent_usur_upt: any;
    
    /**
         * Constructor
         *
         * @param rental
         */
    constructor(rental?) {
        rental = rental || {};
        this.rent_id = rental.rent_id || '0';
        this.rent_borrow_id = rental.rent_borrow_id || '';
        this.rent_prod_id = rental.rent_prod_id || '';
        
        this.rent_start_address_rec = rental.rent_start_address_rec || '';
        this.rent_start_address_rec_ref = rental.rent_start_address_rec_ref || '';
        this.rent_start_time_range_rec = rental.rent_start_time_range_rec || {
            min_range: '',
            max_range: '',
            range_id: 1
        };

        this.rent_end_address_rec = rental.rent_end_address_rec || '';
        this.rent_end_address_rec_ref = rental.rent_end_address_rec_ref || '';
        this.rent_end_time_range_rec = rental.rent_end_time_range_rec || {
            min_range: '',
            max_range: '',
            range_id: 1
        };

        this.rent_status = rental.rent_status || '';
        this.rent_stat_reg = rental.rent_stat_reg || '';
        this.rent_date_reg = rental.rent_date_reg || '';
        this.rent_usur_reg = rental.rent_usur_reg || '';
        this.rent_date_upt = rental.rent_date_upt || '';
        this.rent_usur_upt = rental.rent_usur_upt || '';    
        this.rent_range_date = rental.rent_range_date || {
            rent_end: '',
            rent_start: ''
        };    
    }
}
