import { Router } from "express";
import { RestaurantController } from "./restaurant.controller";
import { validationMiddleware } from "../../shared/middlewares/validation.middleware";
import { CreateRestaurantDto } from "../../shared/dtos/restaurant.dto";


const router = Router();
const restaurantController = new RestaurantController();

router.get("/",  restaurantController.getAllRestaurants);
router.post("/",validationMiddleware(CreateRestaurantDto), restaurantController.createRestaurant);
router.get("/:restaurantId",  restaurantController.getRestaurant);



export default router;
