import type { Knex } from "knex";
// import dotenv from "dotenv";
// dotenv.config();
import {  database, envInit } from './config/env.config';


envInit()

const config: { [key: string]: Knex.Config } = {
  development: {
    client: database.client,
    connection: database.connection,
    migrations: database.migrations,
    seeds: database.seeds
  },
};

export default config;
