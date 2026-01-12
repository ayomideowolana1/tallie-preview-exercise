
import { RestaurantModelType } from "../../models/restaurant.model";
import { RestaurantRepository } from "../../repositories/restaurant.repository";
import { AppError } from "../../shared/error/app.error";
import {
  BusinessHours,
  CreateRestaurantDTO,
  DayOfWeek,
} from "../../shared/types/restaurant.type";
import status from "http-status";
import { databaseTransaction } from "../../shared/utils/database-transaction";
import { BusinessHourRepository } from "../../repositories/business-hour.repository";
import { AddTableDto } from "../../shared/dtos/table.dto";
import { TableRepository } from "../../repositories/table.repository";



export class RestaurantService {
  private restaurantRepository: RestaurantRepository;
  private businessHourRepository: BusinessHourRepository;
  private tableRepository: TableRepository;

  constructor() {
    this.restaurantRepository = new RestaurantRepository();
    this.businessHourRepository = new BusinessHourRepository();
    this.tableRepository = new TableRepository();
  }

  async getAllRestaurants() {
    return await this.restaurantRepository.findAll();
  }
  
  async getRestaurant(restaurantId:string){ 
    return await this.restaurantRepository.findById(restaurantId);
  }

  

  async createRestaurant(payload: CreateRestaurantDTO) {
    const name = payload.name;
    const businessHours = payload.businessHours;

    const result = await databaseTransaction(async (trx) => {
      const restaurant = await this.restaurantRepository.create({ name }, trx);

      console.log("Created Restaurant:", restaurant);

      const multipleBusinessHours = businessHours.map((day) => ({
        ...day,
        restaurantId: restaurant.id,
      }));

      await this.businessHourRepository.createMultiple(
        "restaurant_business_hours",
        multipleBusinessHours,
        trx
      );

      return restaurant
    });

    return result;
  }

  async addTableToRestaurant(payload:AddTableDto){
    const restaurantId = payload.restaurantId;
    const capacity = payload.capacity;

    const restaurant = await this.restaurantRepository.validateId(restaurantId)

    if(!restaurant){
      throw new AppError(status.NOT_FOUND,'Invalid restaurant ID')
    }
    
    if(!restaurant.tables){
      throw new AppError(status.INTERNAL_SERVER_ERROR,'Faieled to fetch restaurant tables')
    }

    const tableNumber =  restaurant.tables.length + 1

    const result = await this.tableRepository.create({
      restaurantId,capacity,tableNumber
    })
    
    return result
  }
}
