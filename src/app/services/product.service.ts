import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { ServicesConfig } from '../app-config/services.config';
import { ResponseModel } from '../models/response.model';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class EcommerceProductService implements Resolve<any>
{
    routeParams: any;
    product: any;

    // products: any[];
    onProductsChanged: BehaviorSubject<any>;

    onProductChanged: BehaviorSubject<any>;
    private detailsUrl = `${this.globalValues.urlProducts()}/details`;
    private UpdateUrl = `${this.globalValues.urlProducts()}/update`;
    private CreateUrl = `${this.globalValues.urlProducts()}/create`;
    // private listUrl = `${this.globalValues.urlProducts()}/list`;
    private DeleteUrl = `${this.globalValues.urlProducts()}/delete`;    

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
        this.onProductChanged = new BehaviorSubject({});
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
        this.routeParams = route.params;

        return new Promise((resolve, reject) => {

            Promise.all([
                this.getProduct(),
                // this.getProducts()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    // getProducts(): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         this._httpClient.get(this.listUrl)
    //             .subscribe((response: any) => {
    //                 this.products = response.data_result.Items;
    //                 this.onProductsChanged.next(this.products);
    //                 resolve(response);
    //             }, reject);
    //     });
    // }

    /**
     * Get product
     *
     * @returns {Promise<any>}
     */
    getProduct(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            if ( this.routeParams.id === 'new' )
            {
                this.onProductChanged.next(false);
                resolve(false);
            }
            else
            {
                const body = {
                    prod_id : this.routeParams.id
                };
                this._httpClient.post(this.detailsUrl, body)
                    .subscribe((response: any) => {
                        this.product = response.data_result.Item;                                               
                        this.onProductChanged.next(this.product);
                        resolve(response);
                    }, reject);
            }
        });
    }

    actualizarProducto(producto): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.UpdateUrl, producto).pipe(
            tap((response: ResponseModel) => this.log(`Resultado del actualizar producto = ${response.res_service}`)),
            catchError(this.handleError<ResponseModel>('actualizar producto'))
        );
    }

    registrarProducto(producto): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.CreateUrl, producto).pipe(
            tap((response: ResponseModel) => this.log(`Resultado del registrarProducto = ${JSON.stringify(response)}`)),
            catchError(this.handleError<ResponseModel>('registrarProducto'))
        );
    }

    deleteProduct(body): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.DeleteUrl, body).pipe(
            tap((response: ResponseModel) => this.log(`Resultado del deleteProduct = ${response.res_service}`)),
            catchError(this.handleError<ResponseModel>('deleteProduct'))
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
