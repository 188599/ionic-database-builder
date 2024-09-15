import { InjectionToken } from '@angular/core';
import { DatabaseCreatorContract, GetMapper } from 'database-builder';
import { DatabaseMigrationContract } from '../services/database-migration-contract';
import { PlatformLoad } from './platform-load';
import { DatabaseFactoryContract } from './database-factory-contract';
import { DatabaseSettingsFactoryContract } from './database-settings-factory-contract';

export const IS_AVAILABLE_DATABASE = new InjectionToken<boolean>('is_available');
export const IS_ENABLE_LOG = new InjectionToken<boolean>('is_enable_log');
export const DATABASE_CREATOR = new InjectionToken<DatabaseCreatorContract>('database_creator');
export const DATABASE_MIGRATION = new InjectionToken<DatabaseMigrationContract>('database_migration');
export const PLATFORM_LOAD = new InjectionToken<PlatformLoad>('platform_load');
export const DATABASE_SETTINGS_FACTORY = new InjectionToken<DatabaseSettingsFactoryContract>('DATABASE_SETTINGS_FACTORY');
export const DATABASE_FACTORY_CONTRACT = new InjectionToken<DatabaseFactoryContract>('DATABASE_FACTORY_CONTRACT');
