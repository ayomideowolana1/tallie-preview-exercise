import knex from "knex";
import { Model } from "objection";
import config from "../knexfile";
import { Knex } from 'knex/types';

import dotenv from "dotenv";
import { envInit } from "../config/env.config";
dotenv.config();





const environment = process.env.NODE_ENV || "development";
const knexInstance: Knex  = knex(config[environment]);

Model.knex(knexInstance);

export default knexInstance;

export const getDB = (): Knex => knexInstance;