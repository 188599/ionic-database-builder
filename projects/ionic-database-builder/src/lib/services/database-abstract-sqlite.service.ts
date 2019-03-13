import { DatabaseCreatorContract, DatabaseConfig, DatabaseObject, DatabaseResult, DatabaseBaseTransaction } from 'database-builder';

export abstract class DatabaseAbstractSQLiteService implements DatabaseCreatorContract {

  protected abstract sqliteCreate(config: DatabaseConfig): Promise<DatabaseSQLiteObject>;

  create(config: DatabaseConfig): Promise<DatabaseObject> {
    return new Promise<DatabaseObject>((resolve, reject) => {
      return this.sqliteCreate(config)
        .then(database => {
          resolve(<DatabaseObject>{
            executeSql: (statement: string, params: any): Promise<DatabaseResult> => {
              return database.executeSql(statement, params);
            },
            transaction: (fn: (transaction: DatabaseBaseTransaction) => void): Promise<any> => {
              return database.transaction(transiction => {
                fn({
                  executeSql: (sql: string, values: any): Promise<DatabaseResult> => {
                    return new Promise<DatabaseResult>((resolve, reject) => {
                      transiction.executeSql(sql, Array.isArray(values) ? values : [],
                        (s, r) => {
                          resolve(r)
                        },
                        (e, err) => {
                          reject(err)
                        });
                    });
                  }
                });
              });
            }
          });
        })
        .catch(err => reject(err));
    });
  }
}

/**
 * @hidden
 */
export interface DatabaseSQLiteObject {
  transaction(fn: (transaction: DatabaseSQLiteTransaction) => void): Promise<any>;
  executeSql(statement: string, params: any): Promise<DatabaseResult>;
}

/**
 * @hidden
 */
export interface DatabaseSQLiteTransaction {
  executeSql: (sql: any, values?: any[], success?: Function, error?: Function) => void;
}