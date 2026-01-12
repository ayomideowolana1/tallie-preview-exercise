import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["src/tests"],
  moduleFileExtensions: ["ts", "js"],
  clearMocks: true,
};

export default config;
