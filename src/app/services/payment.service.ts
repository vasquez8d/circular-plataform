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
    
    private postCreateToken    = `${this.globalValues.urlPayments()}/token`;
    private postCreateCharge   = `${this.globalValues.urlPayments()}/charge`;
    private postCreateCapture  = `${this.globalValues.urlPayments()}/capture`;
    private DetailsUrl         = `${this.globalValues.urlRents()}/details`;
    private DetailsProductUrl  = `${this.globalValues.urlProducts()}/details`;
    private DetailsUserUrl     = `${this.globalValues.urlUsers()}/details`;
    private UpdateRentalStatus = `${this.globalValues.urlRents()}/update/status`;

    constructor(
        private _httpClient: HttpClient,
        private globalValues: ServicesConfig
    ) { }

    postCreateTokenPayment(token): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.postCreateToken, token).pipe(
            tap((response: ResponseModel) => this.log(`Resultado postCreateTokenPayment = ${JSON.stringify(response)}`)),
            catchError(this.handleError<ResponseModel>('postCreateTokenPayment'))
        );
    }

    postCreateChargePayment(token): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.postCreateCharge, token).pipe(
            tap((response: ResponseModel) => this.log(`Resultado postCreateChargePayment = ${JSON.stringify(response)}`)),
            catchError(this.handleError<ResponseModel>('postCreateChargePayment'))
        );
    }

    postCreateCapturePayment(token): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.postCreateCapture, token).pipe(
            tap((response: ResponseModel) => this.log(`Resultado postCreateCapturePayment = ${JSON.stringify(response)}`)),
            catchError(this.handleError<ResponseModel>('postCreateCapturePayment'))
        );
    }

    detailsRental(body): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.DetailsUrl, body).pipe(
            tap((response: ResponseModel) => this.log(`Resultado detailsRental = ${response.res_service}`)),
            catchError(this.handleError<ResponseModel>('detailsRental'))
        );
    }

    detailsProduct(body): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.DetailsProductUrl, body).pipe(
            tap((response: ResponseModel) => this.log(`Resultado del detailsProduct = ${response.res_service}`)),
            catchError(this.handleError<ResponseModel>('detailsProduct'))
        );
    }

    detailsUser(body): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.DetailsUserUrl, body).pipe(
            tap((response: ResponseModel) => this.log(`Resultado del detailsUser = ${JSON.stringify(response)}`)),
            catchError(this.handleError<ResponseModel>('detailsUser'))
        );
    }
    
    patchUpdateRentalStatus(body): Observable<ResponseModel> {
        return this._httpClient.patch<ResponseModel>(this.UpdateRentalStatus, body).pipe(
            tap((response: ResponseModel) => this.log(`Resultado del patchUpdateRentalStatus = ${JSON.stringify(response)}`)),
            catchError(this.handleError<ResponseModel>('patchUpdateRentalStatus'))
        );
    }

    private handleError<T>(operation = 'operation', result?: T): any {
        return (error: any): Observable<T> => {
            console.error(error);
            return of(result as T);
        };
    }

    private log(message: string): void {
        console.log('UserService: ' + message);
    }

}
