import dotenv from "dotenv";

dotenv.config();

import path from "path";

const envPath = path.resolve(__dirname, "../../.env");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("Error loading .env file:", result.error);
  throw new Error("Cannot load .env file");
}

export type NODE_ENV = "development" | "test" | "staging" | "production";
process.env.TZ = `Africa/Nigeria`;

export const app = {
  name: process.env.APP_NAME,
  isProduction: process.env.NODE_ENV === "production",
};

export const database = {
  client: process.env.DB_CLIENT || "mysql2",
  connection: {
    host: process.env.DB_HOST || "127.0.0.1",
    database: process.env.DB_NAME as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    port: process.env.DB_PORT || 3306,
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN as string) || 1,
    max: parseInt(process.env.DB_POOL_MAX as string) || 25,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "./db/migrations",
    extension: "ts",
  },
  seeds: {
    directory: "./db/seeds",
    extension: "ts",
  },
};

export const redis: any = {
  expiryDate: process.env.CONFIG_REDIS_EXPIRYDATE,
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
};

export const envInit = () => {
  const requiredVariables = [
    "PORT",
    "DB_HOST",
    "DB_PORT",
    "DB_USER",
    // "DB_PASSWORD",
    "DB_NAME",
    "DB_POOL_MIN",
    "DB_POOL_MAX",
  ];

  const missingVariables = requiredVariables.reduce(
    (acc: string[], variable: string) => {
      const isVariableMissing = !process.env[variable.toUpperCase()];

      return isVariableMissing ? [...acc, variable.toUpperCase()] : acc;
    },
    []
  );

  if (missingVariables.length) {
    console.log(`\n <--------------------------- \n`);
    console.log(
      `Your .env file is missing the following variables: ${missingVariables.join(
        ","
      )}`
    );
    console.log(`\n ---------------------------> \n`);

    process.exit(1);
  }

  return { status: true };
};
