import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '../../../node_modules/@angular/common/http';
import { ServicesConfig } from '../app-config/services.config';
import { Observable, of, Subject } from 'rxjs';
import { ResponseModel } from '../models/response.model';
import { tap, catchError } from 'rxjs/operators';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'x-api-key': '1TFRraWLki9NIxf3Qat803tdmYZlNy4Y5x7cbGnX'}) };
  private loginUrl = `${this.globalValues.urlAuthUser()}/login`;

  constructor(
    private httpClient: HttpClient,
    private globalValues: ServicesConfig
  ) { }

  login(credentials): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.loginUrl, credentials, this.httpOptions).pipe(
      tap((response: ResponseModel) => this.log(`Resultado del servicio login = ${ JSON.stringify(response) }`)),
      catchError(this.handleError<ResponseModel>('login'))
    );
  }

  getUserLoged(): UserModel {
    let dataUsuario = new UserModel();
    const dataLoginSession = sessionStorage.getItem('usuario_circular');
    const dataLoginLocal = localStorage.getItem('usuario_circular');

    if (dataLoginSession != null) {      
      dataUsuario = JSON.parse(dataLoginSession);
    }

    if (dataLoginLocal != null) {      
      dataUsuario = JSON.parse(dataLoginLocal);
    }

    return dataUsuario;
  }

  getUserLogedId(): string {
    const dataUser = this.getUserLoged();
    return dataUser.user_email;
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
