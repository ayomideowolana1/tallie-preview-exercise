import { Router } from "express";
import { ReservationController } from "./reservation.controller";
import { validationMiddleware } from "../../shared/middlewares/validation.middleware";
import { CreateReservationDto } from "../../shared/dtos/reservation.dto";
// import { validationMiddleware } from "../../shared/middlewares/validation.middleware";
// import { CreateRestaurantDto } from "../../shared/dtos/restaurant.dto";


const router = Router();
const reservationController = new ReservationController();

router.get("/:restaurantId",  reservationController.getRestaurantReservations);
router.post("/", validationMiddleware(CreateReservationDto), reservationController.createReservation);


export default router;
