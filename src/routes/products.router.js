// Imoprt Router:
import { Router } from "express";

// Import ProductController:
import ProductController from "../controllers/productsController.js";

// Passport:
import passport from "passport";

// Import Middleware Admin:
import { rolesMiddlewareAdminAndPremiun } from "./Middlewares/roles.middleware.js";

// Instancia de Router:
const productsRouter = Router();

// Instancia de ProductController: 
let productController = new ProductController();

// Crear un producto - Router:
productsRouter.post('/', passport.authenticate('jwt', { session: false }), rolesMiddlewareAdminAndPremiun, async (req, res, next) => {
    const result = await productController.createProductController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Traer un producto por su ID - Router: 
productsRouter.get('/:pid', async (req, res, next) => { 
    const result = await productController.getProductByIDController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Traer todos los productos - Router: 
productsRouter.get('/', async (req, res) => {
    const result = await productController.getAllProductsController(req, res);
    res.status(result.statusCode).send(result);
});

// Eliminar un producto por su ID - Router:
productsRouter.delete('/:pid', passport.authenticate('jwt', { session: false }), rolesMiddlewareAdminAndPremiun, async (req, res, next) => {
    const result = await productController.deleteProductController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Actualizar un producto - Router:
productsRouter.put('/:pid', passport.authenticate('jwt', { session: false }), rolesMiddlewareAdminAndPremiun, async (req, res, next) => {
    const result = await productController.updatedProductController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Export productsRouter:
export default productsRouter;