import { DatabaseMigrationService } from './database/provider/database-migration-service';
import { TableMapper } from './database/mapper/table-mapper';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DatabaseSettingsFactory } from './database/factory/database-settings-factory';
import { IonicDatabaseBuilderModule, DatabaseBrowserService } from 'ionic-database-builder';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    IonicDatabaseBuilderModule.forRoot(
      DatabaseSettingsFactory,
      DatabaseBrowserService,
      DatabaseMigrationService
    )
  ],
  providers: [
    TableMapper
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
