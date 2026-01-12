import { getDB } from "../../db/knex";
import logger from "./logger";

export async function databaseTransaction<T>(callback: (transaction: any) => Promise<T>): Promise<T> {
  const trx = await getDB().transaction();
  try {
    const result = await callback(trx);
    await trx.commit();
    return result;
  } catch (error) {
    await trx.rollback();
    logger.error({ err: error }, '[DATABASE-TRANSACTION-ERROR]');
    throw error;
  }
}
