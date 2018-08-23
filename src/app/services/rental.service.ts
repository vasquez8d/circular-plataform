import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ServicesConfig } from '../app-config/services.config';
import { ResponseModel } from '../models/response.model';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class RentalService implements Resolve<any>
{
    routeParams: any;
    rental: any;    

    onRentalChanged: BehaviorSubject<any>;
    private DetailsUrl = `${this.globalValues.urlRents()}/details`;
    private UpdateUrl = `${this.globalValues.urlRents()}/update`;
    private CreateUrl = `${this.globalValues.urlRents()}/create`;    
    private DeleteUrl = `${this.globalValues.urlRents()}/delete`;

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
        this.onRentalChanged = new BehaviorSubject({});        
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
                this.getRental(),                
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get rental
     *
     * @returns {Promise<any>}
     */
    getRental(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.routeParams.id === 'new') {
                this.onRentalChanged.next(false);
                resolve(false);
            }
            else {
                const body = {
                    rent_id: this.routeParams.id
                };
                this._httpClient.post(this.DetailsUrl, body)
                    .subscribe((response: any) => {
                        this.rental = response.data_result.Item;
                        this.onRentalChanged.next(this.rental);
                        resolve(response);
                    }, reject);
            }
        });
    }

    updateRental(producto): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.UpdateUrl, producto).pipe(
            tap((response: ResponseModel) => this.log(`Resultado updateRental = ${response.res_service}`)),
            catchError(this.handleError<ResponseModel>('updateRental'))
        );
    }

    createRental(producto): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.CreateUrl, producto).pipe(
            tap((response: ResponseModel) => this.log(`Resultado createRental = ${JSON.stringify(response)}`)),
            catchError(this.handleError<ResponseModel>('createRental'))
        );
    }

    deleteRental(body): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.DeleteUrl, body).pipe(
            tap((response: ResponseModel) => this.log(`Resultado deleteRental = ${response.res_service}`)),
            catchError(this.handleError<ResponseModel>('deleteRental'))
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

    getRangeHours(): any {
        return [
            {
                value: 1,
                text: 'De 8:00 a.m. a 11:00 a.m.',
                min: '8:00',
                max: '11:00'
            },
            {
                value: 2,
                text: 'De 9:00 a.m. a 12:00 p.m.',
                min: '9:00',
                max: '12:00'
            },
            {
                value: 3,
                text: 'De 10:00 a.m. a 1:00 p.m.',
                min: '10:00',
                max: '13:00'
            },
            {
                value: 4,
                text: 'De 11:00 a.m. a 2:00 p.m.',
                min: '11:00',
                max: '14:00'
            },
            {
                value: 5,
                text: 'De 12:00 p.m. a 3:00 p.m.',
                min: '12:00',
                max: '15:00'
            },
            {
                value: 6,
                text: 'De 1:00 p.m. a 4:00 p.m.',
                min: '13:00',
                max: '16:00'
            },
            {
                value: 7,
                text: 'De 2:00 p.m. a 5:00 p.m.',
                min: '14:00',
                max: '17:00'
            },
            {
                value: 8,
                text: 'De 3:00 p.m. a 6:00 p.m.',
                min: '15:00',
                max: '18:00'
            },
            {
                value: 9,
                text: 'De 4:00 p.m. a 7:00 p.m.',
                min: '16:00',
                max: '19:00'
            }
        ];
    }

}
