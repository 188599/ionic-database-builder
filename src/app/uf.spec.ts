import { Uf } from './database/models/uf';
import { TestBed, async } from '@angular/core/testing';
import { DatabaseSettingsFactory } from './database/factory/database-settings-factory';
import { TableMapper } from './database/mapper/table-mapper';
import { IonicDatabaseBuilderModule, Database, DatabaseBrowserService, IS_ENABLE_LOG, DATABASE_CREATOR, DatabaseMockService, DatabaseSettingsFactoryContract } from 'ionic-database-builder';

describe('Uf', () => {
  beforeEach(async(() => {
    const isMock = false;

    TestBed.configureTestingModule({
      imports: [
        IonicDatabaseBuilderModule.forSimple()
      ],
      providers: [
        TableMapper,
        { provide: IS_ENABLE_LOG, useValue: true },
        { provide: DatabaseSettingsFactoryContract, useClass: DatabaseSettingsFactory },
        {
          provide: DATABASE_CREATOR,
          useFactory: (
            mock: DatabaseMockService,
            sqlBrowser: DatabaseBrowserService
          ) => {
            return isMock ? mock : sqlBrowser;
          },
          deps: [DatabaseMockService, DatabaseBrowserService]
        },
        DatabaseBrowserService,
        DatabaseMockService
      ],
    });
  }));

  it('insert', async () => {
    const database: Database = TestBed.get(Database);
    expect(database).toBeTruthy();
    const crud = await database.crud().toPromise();

    await crud.delete(Uf).execute().toPromise();

    const uf: Uf = new Uf();
    uf.nome = "Uf Test";
    const insertResult = await crud.insert(Uf, uf).execute().toPromise();
    expect(insertResult[0].insertId).toBeGreaterThan(0);
    expect(insertResult[0].rowsAffected).toEqual(1);
  });

  it('update', async () => {
    const database: Database = TestBed.get(Database);
    expect(database).toBeTruthy();
    const crud = await database.crud().toPromise();

    await crud.delete(Uf).execute().toPromise();

    const uf: Uf = new Uf();
    uf.nome = "Uf Test";
    const insertResult = await crud.insert(Uf, uf).execute().toPromise();
    expect(insertResult[0].insertId).toBeGreaterThan(0);
    expect(insertResult[0].rowsAffected).toEqual(1);

    uf.nome = "Nova Uf";
    const updateResult = await crud.update(Uf, uf)
      .where(where => where.equal(x => x.codeImport, uf.codeImport))
      .execute().toPromise();
    expect(updateResult[0].rowsAffected).toEqual(1);
  });

  it('read', async () => {
    const database: Database = TestBed.get(Database);
    expect(database).toBeTruthy();
    const crud = await database.crud().toPromise();

    await crud.delete(Uf).execute().toPromise();

    const uf: Uf = new Uf();
    uf.nome = "Uf Test";
    const result = await crud.insert(Uf, uf).execute().toPromise();
    expect(result[0].insertId).toBeGreaterThan(0);
    expect(result[0].rowsAffected).toEqual(1);

    uf.nome = "Nova Uf";
    const updateResult = await crud.update(Uf, uf)
      .where(where => where.equal(x => x.codeImport, uf.codeImport))
      .execute().toPromise();
    expect(updateResult[0].rowsAffected).toEqual(1);

    const ufsRead = await crud.query(Uf)
      .where(where => where.equal(x => x.codeImport, uf.codeImport))
      .toList().toPromise();
    expect(ufsRead.length).toEqual(1);
    expect(ufsRead[0].codeImport).toEqual(uf.codeImport);
    expect(ufsRead[0].nome).toEqual(uf.nome);
  });
});
