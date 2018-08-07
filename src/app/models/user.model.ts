import { Injectable } from '@angular/core';

@Injectable()
export class UserModel {
    user_id: any;
    user_email: any;
    user_password: any;
    user_names: any;
    user_full_name1: any;
    user_full_name2: any;
    user_slug: any;
    user_categ: any;
    user_tip_doc: {
        tip_docum_id: string,
        tip_docum_nom: string
    };
    user_num_doc: any;
    user_url_documen: {
        image_key: string,
        image_desc: string,
    }[];    
    user_num_phone: any;
    user_ubigeo: {
        ubig_dpt: string,
        ubig_prv: string,
        ubig_id: string,
        ubig_dst: string
    };
    user_stat_reg: any;
    user_date_reg: any;
    user_usur_reg: any;
    user_date_upt: any;
    user_usur_upt: any;
    /**
         * Constructor
         *
         * @param user
         */
    constructor(user?) {
        user = user || {};
        this.user_id = user.user_id || '0';
        this.user_email = user.user_email || '';
        this.user_password = user.user_password || '';
        this.user_names = user.user_names || '';
        this.user_full_name1 = user.user_full_name1 || '';
        this.user_full_name2 = user.user_full_name2 || '';
        this.user_slug = user.user_slug || '';
        this.user_categ = user.user_categ || '';
        this.user_tip_doc = user.user_tip_doc || {
            tip_docum_id: '1'
        },      
        this.user_num_doc = user.user_num_doc || '';  
        this.user_url_documen = user.user_url_documen || [];
        
        this.user_num_phone = user.user_num_phone || '';
        this.user_ubigeo = user.user_ubigeo || {
            ubig_dpt: 'Lima',
            ubig_prv: 'Lima',
            ubig_dst: '',
            ubig_id: '0000'
        };
        this.user_stat_reg = user.user_stat_reg || '1';
        this.user_date_reg = user.user_date_reg || null;
        this.user_usur_reg = user.user_usur_reg || null;
        this.user_date_upt = user.user_date_upt || null;
        this.user_usur_upt = user.user_usur_upt || null;
    }

}
