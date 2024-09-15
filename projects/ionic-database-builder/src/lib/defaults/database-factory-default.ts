import { inject, Injectable } from '@angular/core';
import { DatabaseObject } from 'database-builder';
import { Observable, Observer } from 'rxjs';
import { DatabaseFactoryContract } from '../utils/database-factory-contract';
import { DATABASE_CREATOR, IS_AVAILABLE_DATABASE } from '../utils/dependency-injection-definition';

@Injectable()
export class DatabaseFactoryDefault extends DatabaseFactoryContract {

    private _isAvailable = inject(IS_AVAILABLE_DATABASE);
    private _databaseCreator = inject(DATABASE_CREATOR);


    public database(databaseName: string): Observable<DatabaseObject> {
        return new Observable((observer: Observer<DatabaseObject>) => {
            if (this._isAvailable) {
                this._databaseCreator.create({
                    name: databaseName,
                    location: 'default'
                })
                    .then(database => {
                        observer.next(database);
                        observer.complete();
                    })
                    .catch(err => {
                        observer.error(err);
                        observer.complete();
                    });
            } else {
                observer.next(void 0);
                observer.complete();
            }
        });
    }
}
