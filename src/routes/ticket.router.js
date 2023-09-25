// Import Router:
import { Router } from "express";

// Import TicketController: 
import TicketController from '../controllers/ticketsController.js'

// Instancia de Router:
const ticketRouter = Router();

// Instancia de CartController: 
let ticketController = new TicketController();

// Crear un ticket - Router:
ticketRouter.post("/", async (req, res, next) => {
    const result = await ticketController.createTicketController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Traer un ticket por su ID - Router:
ticketRouter.get("/:tid", async (req, res, next) => {
    const result = await ticketController.getTicketByIdController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

export default ticketRouter;