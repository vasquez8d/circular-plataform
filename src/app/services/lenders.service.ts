import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ServicesConfig } from '../app-config/services.config';

@Injectable()
export class LendersService implements Resolve<any>
{
    products: any[];
    onProductsChanged: BehaviorSubject<any>;
    private listUrl = `${this.globalValues.urlUsers()}/list`;
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private globalValues: ServicesConfig
    ) {
        // Set the defaults
        this.onProductsChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.getUsers()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get Lenders
     *
     * @returns {Promise<any>}
     */
    getUsers(): Promise<any> {
        return new Promise((resolve, reject) => {
            const dataCateg = {
                user_categ: {
                    catg_id: '2' // Categoría Lender                    
                }
            };
            this._httpClient.post(this.listUrl, dataCateg)
                .subscribe((response: any) => {
                    this.products = response.data_result.Items;
                    this.onProductsChanged.next(this.products);
                    resolve(response);
                }, reject);
        });
    }
}
