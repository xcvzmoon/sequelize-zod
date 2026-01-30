import type {
  AbstractDataType,
  AbstractDataTypeConstructor,
  DataType,
  RangeableDataType,
} from 'sequelize';
import { DataTypes } from 'sequelize';

import { ColumnBuilder } from './column-builder';

export function integer() {
  return new ColumnBuilder<number>(DataTypes.INTEGER, 'integer');
}

export function bigint() {
  return new ColumnBuilder<bigint>(DataTypes.BIGINT, 'integer');
}

export function float(length?: number, decimals?: number) {
  return new ColumnBuilder<number>(
    decimals !== undefined ? DataTypes.FLOAT(length, decimals) : DataTypes.FLOAT,
    'float',
  );
}

export function real(length?: number, decimals?: number) {
  return new ColumnBuilder<number>(
    decimals !== undefined ? DataTypes.REAL(length, decimals) : DataTypes.REAL,
    'float',
  );
}

export function double(length?: number, decimals?: number) {
  return new ColumnBuilder<number>(
    decimals !== undefined ? DataTypes.DOUBLE(length, decimals) : DataTypes.DOUBLE,
    'float',
  );
}

export function decimal(precision?: number, scale?: number) {
  return new ColumnBuilder<number>(DataTypes.DECIMAL(precision, scale), 'float');
}

export function string(length?: number) {
  return new ColumnBuilder<string>(length ? DataTypes.STRING(length) : DataTypes.STRING, 'string');
}

export function char(length?: number) {
  return new ColumnBuilder<string>(length ? DataTypes.CHAR(length) : DataTypes.CHAR, 'string');
}

export function text(length?: 'tiny' | 'medium' | 'long') {
  return new ColumnBuilder<string>(length ? DataTypes.TEXT(length) : DataTypes.TEXT, 'text');
}

export function boolean() {
  return new ColumnBuilder<boolean>(DataTypes.BOOLEAN, 'boolean');
}

export function date(length?: number) {
  return new ColumnBuilder<Date>(length ? DataTypes.DATE(length) : DataTypes.DATE, 'date');
}

export function dateonly() {
  return new ColumnBuilder<string>(DataTypes.DATEONLY, 'date');
}

export function time() {
  return new ColumnBuilder<string>(DataTypes.TIME, 'date');
}

export function uuid() {
  return new ColumnBuilder<string>(DataTypes.UUID, 'uuid');
}

export function uuidv1() {
  return new ColumnBuilder<string>(DataTypes.UUIDV1, 'uuid');
}

export function uuidv4() {
  return new ColumnBuilder<string>(DataTypes.UUIDV4, 'uuid');
}

export function json<T = any>() {
  return new ColumnBuilder<T>(DataTypes.JSON, 'json');
}

export function jsonb<T = any>() {
  return new ColumnBuilder<T>(DataTypes.JSONB, 'json');
}

export function blob(length?: 'tiny' | 'medium' | 'long') {
  return new ColumnBuilder<Buffer>(length ? DataTypes.BLOB(length) : DataTypes.BLOB, 'blob');
}

export function enumType<T extends string>(...values: T[]) {
  return new ColumnBuilder<T>(DataTypes.ENUM<T>(...values), 'enum');
}

export function array<T>(type: DataType) {
  return new ColumnBuilder<T[]>(
    // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- DataType includes string; ARRAY expects AbstractDataType(Constructor)
    DataTypes.ARRAY(type as AbstractDataTypeConstructor | AbstractDataType),
    'array',
  );
}

export function range(subtype: DataType) {
  return new ColumnBuilder(
    // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- DataType includes string; RANGE expects RangeableDataType
    DataTypes.RANGE(subtype as RangeableDataType),
    'other',
  );
}

export function geometry(type?: string, srid?: number) {
  return new ColumnBuilder(DataTypes.GEOMETRY(type ?? 'GEOMETRY', srid), 'geometry');
}

export function geography(type?: string, srid?: number) {
  return new ColumnBuilder(DataTypes.GEOGRAPHY(type ?? 'GEOGRAPHY', srid), 'geometry');
}

export function hstore() {
  return new ColumnBuilder(DataTypes.HSTORE, 'other');
}

export function cidr() {
  return new ColumnBuilder<string>(DataTypes.CIDR, 'other');
}

export function inet() {
  return new ColumnBuilder<string>(DataTypes.INET, 'other');
}

export function macaddr() {
  return new ColumnBuilder<string>(DataTypes.MACADDR, 'other');
}

export function citext() {
  return new ColumnBuilder<string>(DataTypes.CITEXT, 'string');
}

export function tsvector() {
  return new ColumnBuilder(DataTypes.TSVECTOR, 'other');
}

export function virtual(_returnType: DataType, _dependencies?: string[]) {
  return new ColumnBuilder(DataTypes.VIRTUAL, 'other');
}
