import { Router } from "express";
import { TableController } from "./table.controller";
import { AddTableDto } from "../../shared/dtos/table.dto";
import { validationMiddleware } from "../../shared/middlewares/validation.middleware";
import { TableAvailabilityDto } from "../../shared/dtos/table-availability.dto";



const router = Router();
const tableController = new TableController();

router.post("/check-availability",validationMiddleware(TableAvailabilityDto),  tableController.checkTableAvailability);
router.post("/add-table",validationMiddleware(AddTableDto), tableController.addTableToRestaurant);


export default router;
