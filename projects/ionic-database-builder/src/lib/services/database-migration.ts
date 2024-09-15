import { Version } from './../model/version-model';
import { INJECTOR, Injectable, inject } from '@angular/core';
import { Ddl, DatabaseObject, forkJoinSafe } from 'database-builder';
import { DatabaseMigrationBase } from '../utils/database-migration-base';
import { DatabaseResettableContract } from './database-resettable-contract';
import { Observable, Observer } from 'rxjs';
import { DATABASE_MIGRATION, DATABASE_SETTINGS_FACTORY } from '../utils/dependency-injection-definition';

@Injectable()
export class DatabaseMigration extends DatabaseMigrationBase implements DatabaseResettableContract {

    private _settings = inject(DATABASE_SETTINGS_FACTORY);
    private _databaseMigrationContract = inject(DATABASE_MIGRATION);
    private _injector = inject(INJECTOR);


    public reset(database: DatabaseObject): Observable<any> {

        // tslint:disable-next-line:no-console
        console.info('database reset');

        const observablesWait: Array<Observable<any>> = [];

        const mappers = this._settings.mapper(this._injector);

        // remove dados offline da versão anterior, pois o formato dos dados foi alterado de uma versão para a outra
        const ddl = new Ddl({ database, getMapper: mappers, enableLog: true });
        mappers.forEachMapper((value, key) => {
            if (!value.readOnly) {
                observablesWait.push(ddl.drop(value.newable).execute());
                observablesWait.push(ddl.create(value.newable).execute());
            }
        });

        return forkJoinSafe(observablesWait);
    }

    protected migrationExecute(database: DatabaseObject, version: Version): Observable<boolean> {
        return new Observable((observer: Observer<boolean>) => {

            let observablesNested: Array<Observable<any>> = [];
            if (this._databaseMigrationContract) {
                this._databaseMigrationContract.onStart();
                const toObservables = this._databaseMigrationContract.to(
                    version,
                    database,
                    this._settings.mapper(this._injector),
                    this
                );
                if (toObservables && toObservables.length > 0) {
                    observablesNested = observablesNested.concat(toObservables);
                }
            }

            if (observablesNested.length === 0 && version.oldVersion < 1) {
                observablesNested.push(this.reset(database));
            }

            if (observablesNested.length > 0) {
                this._databaseMigrationContract.onProgress();
            }
            this.callNested(observablesNested, 0)
                .subscribe((result: boolean) => {
                    observer.next(result);
                    observer.complete();
                }, (error: any) => {
                    observer.error(error);
                    observer.complete();
                }, () => {
                    this._databaseMigrationContract.onFinish();
                });
        });
    }

    private callNested(observablesNested: Array<Observable<any>>, nextIndex: number): Observable<boolean> {
        return new Observable((observer: Observer<boolean>) => {
            if (observablesNested.length > nextIndex) {
                observablesNested[nextIndex].subscribe((result: any) => {
                    this.callNested(observablesNested, ++nextIndex).subscribe((_: any) => {
                        observer.next(true);
                        observer.complete();
                    }, (error: any) => {
                        observer.error(error);
                        observer.complete();
                    });
                });
            } else {
                observer.next(true);
                observer.complete();
            }
        });
    }

}
