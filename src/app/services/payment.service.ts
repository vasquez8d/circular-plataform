import { Injectable } from '@angular/core';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import { ServicesConfig } from '../app-config/services.config';
import { Observable, of } from 'rxjs';
import { ResponseModel } from '../models/response.model';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    
    private postCreateToken = `${this.globalValues.urlPayments()}/token`;

    constructor(
        private _httpClient: HttpClient,
        private globalValues: ServicesConfig
    ) { }

    postCreateTokenPayment(token): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.postCreateToken, token).pipe(
            tap((response: ResponseModel) => this.log(`Resultado postCreateTokenPayment = ${response}`)),
            catchError(this.handleError<ResponseModel>('postCreateTokenPayment'))
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
