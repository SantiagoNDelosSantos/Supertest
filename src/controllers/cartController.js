// Import de CartService:
import CartService from '../services/carts.service.js'

// Mongoose para validación de IDs:
import mongoose from "mongoose";

// Errores:
import ErrorEnums from "../errors/error.enums.js";
import CustomError from "../errors/customError.class.js";
import ErrorGenerator from "../errors/error.info.js";

// Clase para el Controller de carritos:
export default class CartController {

    constructor() {
        // Instancia de CartsService:
        this.cartService = new CartService();
    }

    // Métodos de CartController:

    // Crear un carrito - Controller:
    async createCartController(req, res) {
        let response = {};
        try {
            const resultService = await this.cartService.createCartService();
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al crear el carrito - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    // Traer un carrito por su ID - Controller:
    async getCartByIdController(req, res, next) {
        const cid = req.params.cid;
        try {
            if (!cid || !mongoose.Types.ObjectId.isValid(cid)) {
                CustomError.createError({
                    name: "Error al obtener carrito por ID.",
                    cause: ErrorGenerator.generateCidErrorInfo(cid),
                    message: "El ID de carrito proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_CART_ERROR
                });
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.cartService.getCartByIdService(cid);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = 'Error al obtener el carrito por ID - Controller: ' + error.message;
            req.logger.error(response.message);
        };
        return response;
    };


    // Traer todos los carritos - Controller: 
    async getAllCartsController(req, res) {
        let response = {};
        try {
            const resultService = await this.cartService.getAllCartsService();
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = 'Error al obtener los carritos - Controller: ' + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    // Agregar un producto a un carrito - Controller:
    async addProductInCartController(req, res, next) {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const quantity = req.params.quantity;
        try {
            if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
                CustomError.createError({
                    name: "Error al obtener el producto por ID.",
                    cause: ErrorGenerator.generatePidErrorInfo(pid),
                    message: "El ID de producto proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_PRODUCT_ERROR
                });
            } else if (!quantity || isNaN(quantity) || quantity <= 0) {
                CustomError.createError({
                    name: "Error al intentar agregar un producto al carrito.",
                    cause: ErrorGenerator.generateQuantityErrorInfo(quantity),
                    message: "La cantidad debe ser un número válido y mayor que cero.",
                    code: ErrorEnums.QUANTITY_INVALID_ERROR
                });
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            // Extraemos el ID del user: 
            const userId = req.user.userID;
            // Enviamos el cid, pid, quantity y el user al service: 
            const resultService = await this.cartService.addProductToCartService(cid, pid, quantity, userId);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 403) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = 'Error al agregar el producto al carrito - Controller: ' + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    // Procesamiento de la compra del usuario:
    async purchaseProductsInCartController(req, res, next) {
        const cid = req.params.cid;
        const purchaseInfo = req.body;
        const products = purchaseInfo.products;
        const userEmail = purchaseInfo.userEmailAddress;
        try {
            if (!purchaseInfo || !Array.isArray(products) || products.length === 0) {
                let purchase = JSON.stringify(purchaseInfo, null, 2)
                CustomError.createError({
                    name: "Error al Procesar la Compra de Productos en el Carrito.",
                    cause: ErrorGenerator.generatePurchaseErrorInfo(purchase),
                    message: "Información de productos inválida o faltante.",
                    code: ErrorEnums.PRODUCTS_MISSING_OR_INVALID,
                });
            };
            for (const productInfo of products) {
                if (!productInfo.databaseProductID || !mongoose.Types.ObjectId.isValid(productInfo.databaseProductID) || !productInfo.cartProductID || !mongoose.Types.ObjectId.isValid(productInfo.cartProductID)) {
                    const error = CustomError.createError({
                        name: "Error al Procesar la Compra de Productos en el Carrito.",
                        cause: ErrorGenerator.generateProductsPurchaseErrorInfo(productInfo.databaseProductID, productInfo.cartProductID),
                        message: "Uno o más productos tienen un formato inválido.",
                        code: ErrorEnums.INVALID_PRODUCT,
                    });
                    return next(error);
                };
            };
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!userEmail || !emailRegex.test(userEmail)) {
                CustomError.createError({
                    name: "Error al Procesar la Compra de Productos en el Carrito.",
                    cause: ErrorGenerator.generateEmailUserErrorInfo(userEmail),
                    message: "Correo electrónico inválido.",
                    code: ErrorEnums.INVALID_EMAIL,
                })
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.cartService.purchaseProductsInCartService(cid, purchaseInfo, userEmail);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al procesar la compra - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    // Eliminar un producto en carrito - Controller:
    async deleteProductFromCartController(req, res, next) {
        const cid = req.params.cid;
        const pid = req.params.pid;
        try {
            if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
                CustomError.createError({
                    name: "Error al obtener el producto por ID.",
                    cause: ErrorGenerator.generatePidErrorInfo(pid),
                    message: "El ID de producto proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_PRODUCT_ERROR
                });
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.cartService.deleteProductFromCartService(cid, pid);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar producto del carrito - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    // Eliminar todos los productos de un carrito - Controller:
    async deleteAllProductsFromCartController(req, res, next) {
        const cid = req.params.cid;
        let response = {};
        try {
            const resultService = await this.cartService.deleteAllProductFromCartService(cid);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar todos los productos del carrito - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    //  Actualizar un carrito - Controler:
    async updateCartController(req, res, next) {
        const cid = req.params.cid;
        const updatedCartFields = req.body;
        try {
            if (updatedCartFields.tickets) {
                CustomError.createError({
                    name: "Error al intentar actualizar el carrito.",
                    cause: ErrorGenerator.generateUpdatedCartForbiddenErrorInfo(),
                    message: "El cuerpo para el carrito, no es válido.",
                    code: ErrorEnums.FORBIDDEN_UPDATED_CART_FIELDS
                })
            } else if (!updatedCartFields.products || !Array.isArray(updatedCartFields.products) || updatedCartFields.products.length === 0) {
                const updCartFields = JSON.stringify(updatedCartFields, null, 2);
                CustomError.createError({
                    name: "Error al intentar actualizar el carrito.",
                    cause: ErrorGenerator.generateUpdatedCartFieldsErrorInfo(updCartFields),
                    message: "No se proporcionó ningún cuerpo para el carrito.",
                    code: ErrorEnums.INVALID_UPDATED_CART_FIELDS
                })
            };
            const invalidProducts = updatedCartFields.products.some((product) => {
                return !product.product || typeof product.quantity !== "number";
            });
            if (invalidProducts) {
                CustomError.createError({
                    name: "Error al intentar actualizar el carrito.",
                    cause: ErrorGenerator.generateUpdatedCartFieldsErrorInfo2(),
                    message: "Datos de producto incompleto.",
                    code: ErrorEnums.INVALID_UPDATED_CART_FIELDS
                });
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.cartService.updateCartService(cid, updatedCartFields);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 409) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el carrito - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    // Actualizar la cantidad de un producto en carrito - Controller:
    async updateProductInCartController(req, res, next) {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const quantity = req.body.quantity;
        try {
            if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
                CustomError.createError({
                    name: "Error al obtener el producto por ID.",
                    cause: ErrorGenerator.generatePidErrorInfo(pid),
                    message: "El ID de producto proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_PRODUCT_ERROR
                });
            } else if (!quantity || !Number.isFinite(quantity) || quantity <= 0) {
                CustomError.createError({
                    name: "Error al intentar actualizar el producto en carrito",
                    cause: ErrorGenerator.generateUpdatesProdInCartErrorInfo(quantity),
                    message: "No se proporcionó ningún quantity para el producto en carrito.",
                    code: ErrorEnums.INVALID_UPTATED_PROD_IN_CART
                })
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.cartService.updateProductInCartService(cid, pid, quantity);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 409) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el producto en el carrito - Controller:" + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

};