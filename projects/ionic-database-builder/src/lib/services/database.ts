import { inject, Injectable } from '@angular/core';
import { DatabaseObject } from 'database-builder';
import { Observable, Observer } from 'rxjs';
import { BuildableDatabaseManager } from '../utils/buildable-database-manager';
import { IS_AVAILABLE_DATABASE } from '../utils/dependency-injection-definition';
import { DatabaseMigration } from './database-migration';

@Injectable()
export class Database extends BuildableDatabaseManager {

    private _isAvailable = inject(IS_AVAILABLE_DATABASE);
    private _databaseMigration = inject(DatabaseMigration);


    protected migrationVersion(database: DatabaseObject, version: number): Observable<boolean> {
        if (this._isAvailable) {
            return this._databaseMigration.version(database, version);
        }
        return new Observable((observer: Observer<boolean>) => {
            observer.next(true);
            observer.complete();
        });
    }

    protected databaseName(): string {
        return this._databaseSettings.databaseName(this._injector);
    }

    public version(): number {
        return this._databaseSettings.version(this._injector);
    }

    public databaseNameFile(databaseName: string = this.databaseName()): string {
        return this.addDatabaseNameExtension(this.cleanDatabaseName(databaseName));
    }
}
