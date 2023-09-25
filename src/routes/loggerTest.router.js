// Import Router: 
import { Router } from "express";

// Instancia de Router:
const loggerRouter = Router();

// Prueba logger - Router: 
loggerRouter.get("/", async (req, res) => {
    res.send({ message: "¡Prueba de logger!"})
    req.logger.error('Logger - Error');
    req.logger.warn('Logger - Warn');
    req.logger.info('Logger - Info');
    req.logger.http('Logger - HTTP');
    req.logger.verbose('Logger - Verbose');
    req.logger.debug('Logger - Debug');
})

export default loggerRouter;