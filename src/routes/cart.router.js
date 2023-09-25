// Import Router:
import { Router } from "express";

// Import CartController:
import CartController from '../controllers/cartController.js';

// Passport:
import passport from "passport";

// Import Middleware User:
import { rolesMiddlewareUser } from "./Middlewares/roles.middleware.js";

// Import verificación carrito: 
import { verificarPertenenciaCarrito } from "./Middlewares/carts.middleware.js";

// Instancia de Router:
const cartRouter = Router();

// Instancia de CartController: 
let cartController = new CartController();

// Crear un carrito - Router:
cartRouter.post("/", async (req, res) => {
    const result = await cartController.createCartController(req, res);
    res.status(result.statusCode).send(result);
})

// Traer un carrito por su ID - Router:
cartRouter.get("/:cid", async (req, res, next) => {
    const result = await cartController.getCartByIdController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
})

// Traer todos los carritos - Router: 
cartRouter.get('/', async (req, res) => {
    const result = await cartController.getAllCartsController(req, res);
    res.status(result.statusCode).send(result);
});

// Agregar un producto a un carrito - Router:
cartRouter.post('/:cid/products/:pid/quantity/:quantity', passport.authenticate('jwt', { session: false }), rolesMiddlewareUser, verificarPertenenciaCarrito, async (req, res, next) => {
    const result = await cartController.addProductInCartController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Procesamiento de la compra del usuario: 
cartRouter.post('/:cid/purchase', passport.authenticate('jwt', { session: false }), rolesMiddlewareUser, verificarPertenenciaCarrito, async (req, res, next) => {
    const result = await cartController.purchaseProductsInCartController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
})

// Eliminar un producto en carrito - Router:
cartRouter.delete('/:cid/products/:pid', passport.authenticate('jwt', { session: false }), rolesMiddlewareUser, verificarPertenenciaCarrito, async (req, res, next) => {
    const result = await cartController.deleteProductFromCartController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
})

// Eliminar todos los productos de un carrito - Router:
cartRouter.delete('/:cid', passport.authenticate('jwt', { session: false }), rolesMiddlewareUser, verificarPertenenciaCarrito, async (req, res, next) => {
    const result = await cartController.deleteAllProductsFromCartController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Actualizar un carrito - Router:
cartRouter.put('/:cid', passport.authenticate('jwt', { session: false }), rolesMiddlewareUser, verificarPertenenciaCarrito, async (req, res, next) => {
    const result = await cartController.updateCartController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Actualizar la cantidad de un produco en carrito - Router:
cartRouter.put('/:cid/products/:pid', passport.authenticate('jwt', { session: false }), rolesMiddlewareUser, verificarPertenenciaCarrito, async (req, res, next) => {
    const result = await cartController.updateProductInCartController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

export default cartRouter;