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
    private listUrl = `${this.globalValues.urlLenders()}/list`;
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private globalValues: ServicesConfig
    )
    {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.getLenders()
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
    getLenders(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.listUrl)
                .subscribe((response: any) => {                    
                    this.products = response.data_result.Items;                 
                    this.onProductsChanged.next(this.products);
                    resolve(response);
                }, reject);
        });
    }
}
