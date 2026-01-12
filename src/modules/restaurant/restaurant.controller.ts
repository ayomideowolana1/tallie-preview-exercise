import { Request, Response } from "express";
import { RestaurantService } from "./restaurant.service";
import { showGenericResponse } from "../../shared/utils/response.util";
import { AppError } from "../../shared/error/app.error";

export class RestaurantController {
  private RestaurantService: RestaurantService;

  constructor() {
    this.RestaurantService = new RestaurantService();
  }

  getAllRestaurants = async (req: Request, res: Response): Promise<void> => {
    const restaurants = await this.RestaurantService.getAllRestaurants();

    return showGenericResponse({
      response: res,
      status: true,
      data: restaurants,
      message: "Restaurants fetched successfully",
    });
  };

  getRestaurant = async (req: Request, res: Response): Promise<void> => {

    const restaurantId = req.params.restaurantId;

    // if (!restaurantId) {
    //   throw new AppError(400, "Restaurant ID is required");
    // }

    const restaurant = await this.RestaurantService.getRestaurant(restaurantId);

    return showGenericResponse({
      response: res,
      status: true,
      data: restaurant,
      message: "Restaurant fetched successfully",
    });
  };

  createRestaurant = async (req: Request, res: Response): Promise<void> => {
    const data = await this.RestaurantService.createRestaurant(req.body);

    return showGenericResponse({
      response: res,
      status: true,
      data: data,
      message: "Restaurant created successfully",
    });
  };

  
}
