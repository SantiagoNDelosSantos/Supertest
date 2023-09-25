// Import Router: 
import { Router } from 'express';

// Import MessageController:
import MessageController from "../controllers/messageController.js"

// Passport:
import passport from "passport";

// Import Middleware User: 
import { rolesMiddlewareUser } from './Middlewares/roles.middleware.js';

// Instancia de Router:
const msmRouter = Router();

// Instancia de MessageController:
let messageController = new MessageController();

// Crear un mensaje - Router:
msmRouter.post('/', passport.authenticate('jwt', {session: false}), rolesMiddlewareUser, async (req, res, next) => {
    const result = await messageController.createMessageController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Traer todos los mensajes - Router: 
msmRouter.get('/', async (req, res) => {
    const result = await messageController.getAllMessageController(req, res);
    res.status(result.statusCode).send(result);
});

// Borrar un mensaje - Router:
msmRouter.delete('/:mid', async (req, res, next) => {
    const result = await messageController.deleteMessageController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Export msmRouter; 
export default msmRouter;