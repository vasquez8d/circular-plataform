import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { ServicesConfig } from '../app-config/services.config';
import { ResponseModel } from '../models/response.model';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LenderProductsService implements Resolve<any>
{
    products: any[];    
    private ListxLenderUrl = `${this.globalValues.urlProducts()}/listxlender`;

    routeParams: any;
    onProductsChanged: BehaviorSubject<any>;
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
        this.routeParams = route.params;
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
            if (this.routeParams.id === 'new') {
                this.onProductsChanged.next(false);
                resolve(false);
            }
            else {
                const body = {
                    lender_user_id: this.routeParams.id
                };
                this._httpClient.post(this.ListxLenderUrl, body)
                    .subscribe((response: any) => {
                        this.products = response.data_result.Items;
                        this.onProductsChanged.next(this.products);
                        resolve(response);
                    }, reject);
            }
        });
    }

    listProductsxLender(body): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.ListxLenderUrl, body).pipe(
            tap((response: ResponseModel) => this.log(`Resultado del listProductsxLender = ${response.res_service}`)),
            catchError(this.handleError<ResponseModel>('listProductsxLender'))
        );
    }

    // tslint:disable-next-line:typedef
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(error);
            return of(result as T);
        };
    }

    private log(message: string): void {
        console.log('UserService: ' + message);
    }
}
