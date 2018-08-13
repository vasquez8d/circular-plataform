import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegistroUtil {

  constructor(
  ) { }

  obtenerSlugPorNombre(nombre): string {
    let finalName = nombre.toLowerCase();
    finalName = finalName.replace(/\s+/g, '-');
    finalName = finalName.replace('á', 'a');
    finalName = finalName.replace('é', 'e');
    finalName = finalName.replace('í', 'i');
    finalName = finalName.replace('ó', 'o');
    finalName = finalName.replace('ú', 'u');
    finalName = finalName.replace('ñ', 'n');
    finalName = finalName.replace('/', '');
    return finalName;
  }

  obtenerFechaCreacion(): string {
    const date = new Date();
    const dateFormat = ('00' + date.getDate()).slice(-2) + '/' + 
                    ('00' + (date.getMonth() + 1)).slice(-2) + '/' + 
                    date.getFullYear() + ' ' + 
                    ('00' + date.getHours()).slice(-2) + ':' + 
                    ('00' + date.getMinutes()).slice(-2) + ':' + 
                    ('00' + date.getSeconds()).slice(-2);

    return dateFormat;
  }

  obtenerDateFormatFecNac(dateraw): string {
    const date = dateraw;
    const dateFormat = ('00' + date.getDate()).slice(-2) + '/' + 
                    ('00' + (date.getMonth() + 1)).slice(-2) + '/' + 
                    date.getFullYear();
    return dateFormat;
  }
}
