import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HTTP_INTERCEPTORS } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError(error => {
                if (error instanceof HttpErrorResponse) {
                    if (error.status === 401) {
                        return throwError(error.statusText);
                    }

                    const applicationError = error.headers.get('Application-Error');
                    if (applicationError) {
                        return throwError(applicationError);
                    }

                    const serverError = error.error.errors;
                    let modalStateErrors = typeof error.error === 'string' ? error.error : '';
                    if (serverError && typeof serverError === 'object') {
                        for (const key in serverError) {
                            if (serverError[key]) {
                                modalStateErrors += serverError[key] + '\n';
                            }
                        }
                    }
                    return throwError(modalStateErrors || serverError || 'Server Error');
                }
                return throwError('No Error');
            })
        );
    }
}

export const ErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
}