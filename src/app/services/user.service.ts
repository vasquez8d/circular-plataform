import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { ServicesConfig } from '../app-config/services.config';
import { ResponseModel } from '../models/response.model';
import { tap, catchError } from 'rxjs/operators';
import { AppCategoryConfig } from '../app-config/app-categorys.config';

@Injectable()
export class UserService implements Resolve<any>
{
    routeParams: any;
    lender: any;
    router: any;
    onProductChanged: BehaviorSubject<any>;
    private detailsUrl = `${this._globalValues.urlUsers()}/details`;
    private UpdateUrl = `${this._globalValues.urlUsers()}/update`;
    private CreateUrl = `${this._globalValues.urlUsers()}/create`;
    private DeleteUserUrl = `${this._globalValues.urlUsers()}/delete`;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private _globalValues: ServicesConfig,
        private _appCategConfig: AppCategoryConfig,
        private _router: Router
    )
    {
        // Set the defaults
        this.onProductChanged = new BehaviorSubject({});
        this.router = _router;
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
                this.getLender()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get product
     *
     * @returns {Promise<any>}
     */
    getLender(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            if ( this.routeParams.id === 'new' )
            {
                this.onProductChanged.next(false);
                resolve(false);
            }
            else
            {
                const currentRoute = window.location.href.split('/');
                console.log(currentRoute);
                let categ_id = '';
                if (currentRoute[3] === 'lenders') {
                    categ_id = this._appCategConfig.getLenderCategory();
                } else if (currentRoute[3] === 'borrowers') {
                    categ_id = this._appCategConfig.getBorrowerCategory();
                } else if (currentRoute[3] === 'rents') {
                    categ_id = this._appCategConfig.getBorrowerCategory();
                }
                const body = {
                    user_id : this.routeParams.id,
                    catg_id: categ_id
                };                        
                console.log(body);
                this._httpClient.post(this.detailsUrl, body)
                    .subscribe((response: any) => {    
                        console.log(response);      
                        if (response.data_result.Count > 0 ) {
                            this.lender = response.data_result.Items[0];      
                        }                                                            
                        this.onProductChanged.next(this.lender);
                        resolve(response);
                    }, reject);
            }
        });
    }

    detailsLender(body): Observable<ResponseModel> {        
        return this._httpClient.post<ResponseModel>(this.detailsUrl, body).pipe(
            tap((response: ResponseModel) => this.log(`Resultado del detailsLender = ${JSON.stringify(response)}`)),
            catchError(this.handleError<ResponseModel>('detailsLender'))
        );
    }

    updateLender(lender): Observable<ResponseModel> {
        return this._httpClient.patch<ResponseModel>(this.UpdateUrl, lender).pipe(
            tap((response: ResponseModel) => this.log(`Resultado del updateLender = ${JSON.stringify(response)}`)),
            catchError(this.handleError<ResponseModel>('updateLender'))
        );
    }

    createLender(lender): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.CreateUrl, lender).pipe(
            tap((response: ResponseModel) => this.log(`Resultado del createLender = ${JSON.stringify(response)}`)),
            catchError(this.handleError<ResponseModel>('createLender'))
        );
    }
    

    deleteUser(body): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.DeleteUserUrl, body).pipe(
            tap((response: ResponseModel) => this.log(`Resultado del deleteUser = ${JSON.stringify(response)}`)),
            catchError(this.handleError<ResponseModel>('deleteUser'))
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

    cargarDistritosLima(): any {
        return [
            {
                dst_id: '01',
                dst_nombre: 'Lima'                
            },
            {
                dst_id: '02',
                dst_nombre: 'Ancón'                
            },
            {
                dst_id: '03',
                dst_nombre: 'Ate'                
            },
            {
                dst_id: '04',
                dst_nombre: 'Barranco'                
            },
            {
                dst_id: '05',
                dst_nombre: 'Breña'                
            },
            {
                dst_id: '06',
                dst_nombre: 'Carabayllo'                
            },
            {
                dst_id: '07',
                dst_nombre: 'Chaclacayo'                
            },
            {
                dst_id: '08',
                dst_nombre: 'Chorrillos'                
            },
            {
                dst_id: '09',
                dst_nombre: 'Cieneguilla'                
            },
            {
                dst_id: '10',
                dst_nombre: 'Comas'                
            },
            {
                dst_id: '11',
                dst_nombre: 'El Agustino'                
            },
            {
                dst_id: '12',
                dst_nombre: 'Independencia'                
            },
            {
                dst_id: '13',
                dst_nombre: 'Jesus Maria'                
            },
            {
                dst_id: '14',
                dst_nombre: 'La Molina'                
            },
            {
                dst_id: '15',
                dst_nombre: 'La Victoria'                
            },
            {
                dst_id: '16',
                dst_nombre: 'Lince'                
            },
            {
                dst_id: '17',
                dst_nombre: 'Los Olivos'                
            },
            {
                dst_id: '18',
                dst_nombre: 'Lurigancho'                
            },
            {
                dst_id: '19',
                dst_nombre: 'Lurin'                
            },
            {
                dst_id: '20',
                dst_nombre: 'Magdalena del Mar'                
            },
            {
                dst_id: '21',
                dst_nombre: 'Pueblo Libre'                
            },
            {
                dst_id: '22',
                dst_nombre: 'Miraflores'                
            },
            {
                dst_id: '23',
                dst_nombre: 'Pachacamac'                
            },
            {
                dst_id: '24',
                dst_nombre: 'Pucusana'                
            },
            {
                dst_id: '25',
                dst_nombre: 'Puente Piedra'                
            },
            {
                dst_id: '26',
                dst_nombre: 'Punta Hermosa'                
            },
            {
                dst_id: '27',
                dst_nombre: 'Punta Negra'                
            },
            {
                dst_id: '28',
                dst_nombre: 'Rimac'                
            },
            {
                dst_id: '29',
                dst_nombre: 'San Bartolo'                
            },
            {
                dst_id: '30',
                dst_nombre: 'San Borja'                
            },
            {
                dst_id: '31',
                dst_nombre: 'San Isidro'                
            },
            {
                dst_id: '32',
                dst_nombre: 'San Juan de Lurigancho'                
            },
            {
                dst_id: '33',
                dst_nombre: 'San Juan de Miraflores'                
            },
            {
                dst_id: '34',
                dst_nombre: 'San Luis'                
            },
            {
                dst_id: '35',
                dst_nombre: 'San Martin de Porres'                
            },
            {
                dst_id: '36',
                dst_nombre: 'San Miguel'                
            },
            {
                dst_id: '37',
                dst_nombre: 'Santa Anita'                
            },
            {
                dst_id: '38',
                dst_nombre: 'Santa Maria del Mar'                
            },
            {
                dst_id: '39',
                dst_nombre: 'Santa Rosa'                
            },
            {
                dst_id: '40',
                dst_nombre: 'Santiago de Surco'                
            },
            {
                dst_id: '41',
                dst_nombre: 'Surquillo'                
            },
            {
                dst_id: '42',
                dst_nombre: 'Villa El Salvador'                
            },            
            {
                dst_id: '43',
                dst_nombre: 'Villa Maria del Triunfo'
            }
        ];
    }
}
