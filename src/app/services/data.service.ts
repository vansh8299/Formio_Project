import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  pdfdata!: string;
  addpdf(url:string){
    this.pdfdata=url;
  }
  getpdf():string{
    return this.pdfdata;
  }
}
