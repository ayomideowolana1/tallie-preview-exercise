import { Model, raw, Transaction, SingleQueryBuilder, QueryBuilderType } from 'objection';

import { getDB } from '../db/knex';
import logger from '../shared/utils/logger';
import { AppError } from '../shared/error/app.error';
import httpStatus from 'http-status';
import { QueryBuilder } from "objection";

export abstract class BaseRepository<T, M extends Model> {
  private model: typeof Model | any;

  constructor(model: M | any) {
    this.model = model;
  }

  async createMultiple(table_name: string, payload: Array<Partial<T>>, trx?: Transaction) {
    try {
      let result;
      if (trx) {
        result = await trx(table_name).insert(payload);
      } else {
        result = await getDB()(table_name).insert(payload);
      }

      console.log(result);
      return result;
    } catch (error: any) {
      console.log(error);
      logger.error('',error.message);
      throw new AppError( httpStatus.BAD_REQUEST, 'Failed To Create Multiple Records');
    }
  }

  async create(payload: Partial<T>, trx?: Transaction): Promise<SingleQueryBuilder<QueryBuilderType<M>>> {
    console.log(payload)
    return await this.model.query(trx).insert(payload).debug();
  }

  async update(query_filter: Partial<T>, payload: Partial<T>, trx?: Transaction): Promise<number> {
    try {
      const result = await this.model.query(trx).where(query_filter).update(payload);
      console.log(result);
      return result;
    } catch (error: any) {
      logger.error('',error.message);
      throw new AppError(  httpStatus.BAD_REQUEST, 'Failed To Update Record');
    }
  }

  async getAll(): Promise<Array<T>> {
    return await this.model.query();
  }

  async getAllWhere(args: object): Promise<Array<T>> {
    return await this.model.query().where(args);
  }

  async getSingleByRef(ref: string, trx?: Transaction) {
    return await this.model.query(trx).findOne('ref', ref);
  }

  async findOne({
    payload,
    preload = [],
    trx,
    columns = [],
  }: {
    payload: Partial<T>;
    preload?: { key: keyof Partial<T>; tableColumns?: string[]; excludeSoftDeleted?: boolean }[];
    columns?: (keyof T)[];
    trx?: Transaction;
  }): Promise<T | undefined> {
    const preloadKeys = preload.map((single) => single.key);
    const selectQueryArgument = columns && columns.length ? [...columns] : '*';

    let query = this.model.query(trx).where(payload).select(selectQueryArgument);

    if (preloadKeys.length) {
      query = query.withGraphFetched(`[${preloadKeys.join(', ')}]`);
    }

    for (const { key, tableColumns, excludeSoftDeleted } of preload) {
      const selectedColumns = tableColumns && tableColumns?.length ? [...tableColumns] : '*';
      const referencedTableName = this.model.getRelation(key).relatedModelClass.tableName;

      query = query.modifyGraph(key, (queryBuilder: QueryBuilder<M>) => {
        queryBuilder.select(selectedColumns);

        if (excludeSoftDeleted) {
          queryBuilder.whereNull(`${referencedTableName}.deletedAt`);
        }
      });
    }

    return await query.first();
  }

  async find({
    payload,
    trx,
    columns = [],
    preload = [],
    limit,
    offset,
    orderBy,
    dateFilters,
    search,
  }: {
    payload: Partial<T>;
    columns?: (keyof T)[];
    preload?: { key: keyof Partial<T>; tableColumns?: string[]; excludeSoftDeleted?: boolean }[];
    trx?: Transaction;
    limit?: number;
    offset?: number;
    orderBy?: { column: keyof T; direction: 'ASC' | 'DESC' };
    dateFilters?: { column: keyof T; startDate?: string | Date; endDate?: string | Date };
    search?: { columns: (keyof T)[]; query: string };
  }): Promise<T[]> {
    const preloadKeys = preload.map((single) => single.key);
    const selectQueryArgument = columns && columns.length ? [...columns] : '*';

    let query = this.model.query(trx).where(payload).select(selectQueryArgument).debug();

    // Handle array values in payload by using whereIn
    for (const [key, value] of Object.entries(payload)) {
      if (Array.isArray(value)) {
        query = query.whereIn(key, value);
      }
    }

    if (preloadKeys.length) {
      query = query.withGraphFetched(`[${preloadKeys.join(', ')}]`);
    }

    if (dateFilters && dateFilters?.startDate) {
      query = query.where(dateFilters.column, '>=', dateFilters.startDate);
    }

    if (dateFilters && dateFilters?.endDate) {
      query = query.where(dateFilters.column, '<=', dateFilters.endDate);
    }

    if (search && search?.query && search?.columns?.length) {
      query = query.where((builder:QueryBuilder<M>) => {
        for (const column of search.columns) {
          builder.orWhere(column as string, 'like', `%${search.query.toLowerCase()}%`);
        }
      });
    }

    if (orderBy) {
      query = query.orderBy(orderBy.column, orderBy.direction);
    }

    if (offset !== undefined) {
      query = query.offset(offset);
    }

    if (limit) {
      query = query.limit(limit);
    }

    for (const { key, tableColumns, excludeSoftDeleted } of preload) {
      const selectedColumns = tableColumns && tableColumns?.length ? [...tableColumns] : '*';
      const referencedTableName = this.model.getRelation(key).relatedModelClass.tableName;

      query = query.modifyGraph(key, (queryBuilder:QueryBuilder<M>) => {
        queryBuilder.select(selectedColumns);

        if (excludeSoftDeleted) {
          queryBuilder.whereNull(`${referencedTableName}.deletedAt`);
        }
      });
    }

    return await query;
  }

  async delete({
    query_filter,
    soft_delete,
    soft_delete_column = 'deletedAt',
    trx,
  }: {
    query_filter: Partial<T>;
    soft_delete?: boolean;
    soft_delete_column?: string;
    trx?: Transaction;
  }): Promise<void> {
    try {
      if (!soft_delete) {
        const result = await this.model.query(trx).where(query_filter).delete();
        console.log(result);
        return result;
      } else {
        const result = await this.model
          .query(trx)
          .where(query_filter)
          .update({ [soft_delete_column]: new Date().toISOString().slice(0, 19).replace('T', ' ') });
        console.log(result);
        return result;
      }
    } catch (error: any) {
      logger.error('',error.message);
      throw new AppError( httpStatus.BAD_REQUEST, 'Failed To Delete Record');
    }
  }

}
