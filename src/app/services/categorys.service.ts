import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '../../../node_modules/@angular/common/http';
import { ServicesConfig } from '../app-config/services.config';
import { Observable, of, Subject } from 'rxjs';
import { ResponseModel } from '../models/response.model';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategorysService {
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  private listarCatgUrl = `${this.globalValues.urlCategorias()}/list`;

  constructor(
    private httpClient: HttpClient,
    private globalValues: ServicesConfig
  ) { }

  obtenerCategorias(): Observable<ResponseModel> {
    return this.httpClient.get<ResponseModel>(this.listarCatgUrl, this.httpOptions).pipe(
      tap((response: ResponseModel) => this.log(`Resultado del servicio login = ${response.res_service}`)),
      catchError(this.handleError<ResponseModel>('login'))
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
