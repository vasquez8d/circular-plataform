import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '../../../node_modules/@angular/common/http';
import { ServicesConfig } from '../app-config/services.config';
import { Observable, of, Subject } from 'rxjs';
import { ResponseModel } from '../models/response.model';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class S3Service {
    
    private getImageS3Url = `${this.globalValues.urlS3()}/get`;
    private uploadImageS3Url = `${this.globalValues.urlS3()}/upload`;
    private uploadFileNameUrl = `${this.globalValues.urlS3()}/updatefilename`;

    constructor(
        private _httpClient: HttpClient,
        private globalValues: ServicesConfig
    ) { }

    getImageS3(s3Body): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.getImageS3Url, s3Body).pipe(
            tap((response: ResponseModel) => this.log(`Resultado getImageS3 = ${response.res_service}`)),
            catchError(this.handleError<ResponseModel>('getImageS3'))
        );
    }

    uploadImageS3(data): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.uploadImageS3Url, data).pipe(
            tap((response: ResponseModel) => this.log(`Resultado uploadImageS3 = ${response.res_service}`)),
            catchError(this.handleError<ResponseModel>('uploadImageS3'))
        );
    }

    uploadFileName(data): Observable<ResponseModel> {
        return this._httpClient.patch<ResponseModel>(this.uploadFileNameUrl, data).pipe(
            tap((response: ResponseModel) => this.log(`Resultado uploadFileName = ${response.res_service}`)),
            catchError(this.handleError<ResponseModel>('uploadFileName'))
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
