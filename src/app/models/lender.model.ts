import { Injectable } from '@angular/core';

@Injectable()
export class Lender
{
    lndr_id: string;
    lndr_nombres: string;
    lndr_ape_paterno: string;
    lndr_ape_materno: string;
    lndr_slug: string;
    lndr_tip_documen: {
        tip_docum_id: string,
        tip_docum_nom: string
    };
    lndr_num_documen: string;
    lndr_url_documen: {
        image_key: string,
        image_desc: string,
    }[];
    lndr_num_celular: string;
    lndr_email: string;
    lndr_ubigeo: {
        ubig_dpt: string,
        ubig_prv: string,
        ubig_id: string,
        ubig_dst: string
    };
    lndr_est_registro: string;
    lndr_fec_registro: string;
    lndr_usu_registro: string;
    lndr_fec_actualiza: string;
    lndr_usu_actualiza: string;
    /**
     * Constructor
     *
     * @param lender
     */
    constructor(lender?)
    {
        lender = lender || {};
        this.lndr_id = lender.lndr_id || '0';
        this.lndr_nombres = lender.lndr_nombres || '';
        this.lndr_ape_paterno = lender.lndr_ape_paterno || '';
        this.lndr_ape_materno = lender.lndr_ape_materno || '';
        this.lndr_slug = lender.lndr_slug || '';
        this.lndr_tip_documen = lender.lndr_tip_documen || {
            tip_docum_id: '1'
        },
        this.lndr_num_documen = lender.lndr_num_documen || '';
        this.lndr_url_documen = lender.lndr_url_documen || [];
        this.lndr_num_celular = lender.lndr_num_celular || '';
        this.lndr_email = lender.lndr_email || '';
        this.lndr_ubigeo = lender.lndr_ubigeo || {
            ubig_dpt: 'Lima',
            ubig_prv: 'Lima',
            ubig_dst: '',
            ubig_id: '0000'
        };
        this.lndr_est_registro = lender.lndr_est_registro || '1';
        this.lndr_fec_registro = lender.lndr_fec_registro || null;
        this.lndr_usu_registro = lender.lndr_usu_registro || null;
        this.lndr_fec_actualiza = lender.lndr_fec_actualiza || null;
        this.lndr_usu_actualiza = lender.lndr_usu_actualiza || null;
    }
}
