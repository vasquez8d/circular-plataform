import { Injectable } from '@angular/core';

@Injectable()
export class Product
{
    prod_id: string;
    prod_nombre: string;
    prod_desc: string;
    prod_tags: string[];
    prod_slug: string;
    prod_categoria: string;
    prod_rango_precios: {
        rango: string,
        precio: string
    }[];
    prod_dir_entrega: string;
    prod_hora_entrega: string;
    prod_dir_recibe: string;
    prod_hora_recibe: string;
    prod_est_alquiler: string;
    prod_est_registro: string;
    prod_fec_registro: string;
    prod_usu_registro: string;

    /**
     * Constructor
     *
     * @param product
     */
    constructor(product?)
    {
        product = product || {};
        this.prod_id = product.prod_id || '0';
        this.prod_nombre = product.prod_nombre || '';
        this.prod_desc = product.prod_desc || '';
        this.prod_tags = product.prod_tags || [];
        this.prod_slug = product.prod_slug || '';
        this.prod_categoria = product.prod_categoria || '';
        this.prod_rango_precios = product.prod_rango_precios || [];
        this.prod_dir_entrega = product.prod_dir_entrega || '';
        this.prod_hora_entrega = product.prod_hora_entrega || '';
        this.prod_dir_recibe = product.prod_dir_recibe || '';
        this.prod_hora_recibe = product.prod_hora_recibe || '';
        this.prod_est_alquiler = product.prod_est_alquiler || '';
        this.prod_est_registro = product.prod_est_registro || '';
        this.prod_fec_registro = product.prod_fec_registro || '';
        this.prod_usu_registro = product.prod_usu_registro || '';
    }
}
