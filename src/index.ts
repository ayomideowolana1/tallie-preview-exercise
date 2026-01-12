import express, { Request, Response } from "express";
import knexInstance from "./db/knex";
import dotenv from "dotenv";
import restaurantRoutes from "./modules/restaurant/restaurant.route";
import reservationRoutes from "./modules/reservation/reservation.route";
import tableRoutes from "./modules/table/table.route";
import "reflect-metadata";
import { envInit } from "./config/env.config";

dotenv.config();
envInit()

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello World!" });
});


app.get("/health", async (req: Request, res: Response) => {
  try {
    await knexInstance.raw("SELECT 1");
    res.json({ status: "OK", database: "Connected" });
  } catch (error) {
    res.status(500).json({ status: "Error", database: "Disconnected" });
  }
});

app.use("/api/restaurant", restaurantRoutes);
app.use("/api/reservation", reservationRoutes);
app.use("/api/table", tableRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
