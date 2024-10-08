import { inject, INJECTOR } from '@angular/core';
import { Crud, DatabaseBuilderError, DatabaseObject, DatabaseResult, Ddl, ExecutableBuilder, GetMapper, Query, QueryCompiled } from 'database-builder';
import { ManagedTransaction } from 'database-builder/src/transaction/managed-transaction';
import { from, Observable, Observer, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DatabaseManager } from './database-manager';
import { DATABASE_SETTINGS_FACTORY, IS_ENABLE_LOG } from './dependency-injection-definition';

export abstract class BuildableDatabaseManager extends DatabaseManager {

    protected _databaseSettings = inject(DATABASE_SETTINGS_FACTORY);
    protected _injector = inject(INJECTOR);
    public enableLog = inject(IS_ENABLE_LOG) ?? true;
    private _mapper = this._databaseSettings.mapper(this._injector);


    public get mapper(): GetMapper {
        return this._mapper;
    }

    public databaseInstance(): Promise<DatabaseObject> {
        const database = super.databaseInstance(this.databaseName(), this.version());
        if (!database) {
            throw new Error('SQLite not avaliable!');
        }
        return database;
    }

    public managedTransaction(): Observable<ManagedTransaction> {
        return from(this.databaseInstance()).pipe(mergeMap((database: DatabaseObject) => {
            if (!database.managedTransaction) {
                throw new DatabaseBuilderError('Managed Transaction not supported in current middleware!');
            }
            return of(database.managedTransaction());
        }));
    }

    // /**
    //  * @deprecated Use managedTransaction()
    //  */
    // public newTransaction(successTransaction: () => void): Observable<DatabaseBaseTransaction> {
    //     return new Observable((observer: Observer<DatabaseBaseTransaction>) => {
    //         this.databaseInstance()
    //             .then(database => {
    //                 database.transaction((result: DatabaseBaseTransaction) => {
    //                     observer.next(result);
    //                     observer.complete();
    //                 })
    //                     .then(x => {
    //                         successTransaction();
    //                     })
    //                     .catch(error => {
    //                         observer.error(error);
    //                         observer.complete();
    //                     });
    //             })
    //             .catch(err => {
    //                 observer.error(err);
    //                 observer.complete();
    //             });
    //     });
    // }

    // /**
    //  * @deprecated Use managedTransaction()
    //  */
    // public transaction(successTransaction: () => void): Observable<Crud> {
    //     return new Observable((observer: Observer<Crud>) => {
    //         this.newTransaction(successTransaction)
    //             .subscribe((transaction) => {
    //                 observer.next(new Crud({ database: transaction, getMapper: this._mapper, enableLog: this.enableLog }));
    //                 observer.complete();
    //             }, error => {
    //                 observer.error(error);
    //                 observer.complete();
    //             });
    //     });
    // }

    /**
     * @deprecated Use managedTransaction()
     */
    public beginTransaction(): Observable<Crud> {
        return new Observable((observer: Observer<Crud>) => {
            this.sql('BEGIN TRANSACTION')
                .subscribe(r => {
                    this.crud()
                        .subscribe(crud => {
                            observer.next(crud);
                            observer.complete();
                        }, error => {
                            observer.error(error);
                            observer.complete();
                        });
                }, error => {
                    observer.error(error);
                    observer.complete();
                });
        });
    }

    /**
     * @deprecated Use managedTransaction()
     */
    public commitTransaction(): Observable<boolean> {
        return new Observable((observer: Observer<boolean>) => {
            this.sql('COMMIT')
                .subscribe(r => {
                    observer.next(true);
                    observer.complete();
                }, error => {
                    observer.error(error);
                    observer.complete();
                });
        });
    }

    /**
     * @deprecated Use managedTransaction()
     */
    public rollbackTransaction(): Observable<boolean> {
        return new Observable((observer: Observer<boolean>) => {
            this.sql('ROLLBACK')
                .subscribe(r => {
                    observer.next(true);
                    observer.complete();
                }, error => {
                    observer.error(error);
                    observer.complete();
                });
        });
    }

    public crud(): Observable<Crud> {
        return new Observable((observer: Observer<Crud>) => {
            this.databaseInstance()
                .then(async database => {
                    observer.next(
                        new Crud(
                            await this._databaseSettings.config(this._injector, database),
                            { database, getMapper: this._mapper, enableLog: this.enableLog }
                        )
                    );
                    observer.complete();
                })
                .catch(error => { observer.error(error); observer.complete(); });
        });
    }

    public sql(sql: string, params: any[] = []): Observable<DatabaseResult> {
        return new Observable((observer: Observer<DatabaseResult>) => {
            this.databaseInstance()
                .then(database => {
                    const executable = new ExecutableBuilder(this.enableLog);
                    executable.execute([{
                        query: sql,
                        params
                    } as QueryCompiled], database)
                        .subscribe((cursor: DatabaseResult[]) => {
                            observer.next(cursor[0]);
                            observer.complete();
                        }, err => {
                            observer.error(err);
                            observer.complete();
                        });
                })
                .catch(err => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }

    public query<T>(typeT: new () => T, alias: string = void 0): Observable<Query<T>> {
        return new Observable((observer: Observer<Query<T>>) => {
            this.databaseInstance()
                .then(database => {
                    const that = this;
                    observer.next(new Query(typeT, {
                        alias,
                        getMapper: (tKey: (new () => any) | string) => {
                            return that._mapper.get(tKey);
                        },
                        mapperTable: this._mapper.get(typeT).mapperTable,
                        database,
                        enableLog: this.enableLog
                    }));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(error);
                    observer.complete();
                });
        });
    }

    public ddl(): Observable<Ddl> {
        return new Observable((observer: Observer<Ddl>) => {
            this.databaseInstance()
                .then(database => {
                    observer.next(new Ddl({ database, getMapper: this._mapper, enableLog: this.enableLog }));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(error);
                    observer.complete();
                });
        });
    }

    protected abstract databaseName(): string;

    public abstract version(): number;
}
