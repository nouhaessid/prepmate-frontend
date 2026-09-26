import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/api/v1/users`;

  createUserIfNotExists(): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/me`, {});
  }
}