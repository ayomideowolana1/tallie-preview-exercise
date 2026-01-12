import db from "../db/knex";
import { TableModel,TableModelType } from "../models/table.model";
import { Transaction } from 'objection';
import { BaseRepository } from "./base.repository";

export class TableRepository extends BaseRepository<TableModelType,TableModel>{
  private tableName = "restaurant_tables";

  constructor() {
      super(TableModel);
    }

  async findAll(): Promise<TableModel[]> {
    return await TableModel.query().where({});
  }
  
  async findById(tableId:string): Promise<TableModel | undefined> {
    return await TableModel.query().findById(tableId);
  }
  
  async validateId(tableId: string, trx?: Transaction) {
    return await TableModel.query(trx).findById(tableId).withGraphFetched('restaurant')
  }

  
}