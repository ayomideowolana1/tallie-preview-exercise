import dotenv from "dotenv";

dotenv.config();

describe("Environment variables", () => {
  const requiredVariables = [
    "PORT",
    "DB_HOST",
    "DB_PORT",
    "DB_USER",
    "DB_NAME",
    "DB_POOL_MIN",
    "DB_POOL_MAX",
  ];

  it("should have all required environment variables defined", () => {
    const missingVariables = requiredVariables.filter(
      (variable) => !process.env[variable]
    );

    expect(missingVariables).toEqual([]);
  });
});
