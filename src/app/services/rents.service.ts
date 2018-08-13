import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ServicesConfig } from '../app-config/services.config';

@Injectable()
export class RentsService implements Resolve<any>
{
    rents: any[];
    onRentsChanged: BehaviorSubject<any>;
    private ListUrl = `${this.globalValues.urlProducts()}/list`;

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
        this.onRentsChanged = new BehaviorSubject({});
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
                this.getProducts()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get products
     *
     * @returns {Promise<any>}
     */
    getProducts(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(this.ListUrl)
                .subscribe((response: any) => {
                    this.rents = response.data_result.Items;
                    this.onRentsChanged.next(this.rents);
                    resolve(response);
                }, reject);
        });
    }
}
