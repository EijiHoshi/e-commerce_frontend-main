import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private router: Router) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const token = localStorage.getItem('token');

        console.log('AuthInterceptor: Processing request to', request.url);
        console.log('AuthInterceptor: Token exists:', !!token);

        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                console.log('AuthInterceptor: HTTP Error', error.status, error.url);

                if (error.status === 401) {
                    console.log('AuthInterceptor: 401 Unauthorized, clearing token and redirecting');
                    // Clear token dan user role
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');

                    // Redirect ke login dengan path yang benar
                    this.router.navigate(['/auth/login']);
                }
                return throwError(() => error);
            })
        );
    }
} 