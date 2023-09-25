// Import mongoose para el mongoose.connect:
import mongoose from "mongoose";

// Import del modelo de carritos:
import {
    cartModel
} from "./models/carts.model.js";

import {
    ticketModel
} from "./models/ticket.model.js";
// Import de variables de entorno:
import {
    envMongoURL
} from "../../config.js";

// Clase para el DAO de carritos:
export default class CartsDAO {

    // Conexión Mongoose:
    connection = mongoose.connect(envMongoURL);

    // Crear un carrito - DAO:
    async createCart() {
        let response = {};
        try {
            const result = await cartModel.create({
                products: [],
                tickets: []
            });
            response.status = "success";
            response.result = result;
        } catch (error) {
            response.status = "error";
            response.message = "Error al crear el carrito - DAO: " + error.message;
        };
        return response;
    };

    // Traer un carrito por su ID - DAO:
    async getCartById(cid) {
        let response = {};
        try {
            const result = await cartModel.findOne({
                _id: cid
            }).populate(['products.product', 'tickets.ticketsRef']);
            if (result === null) {
                response.status = "not found cart";
            } else {
                response.status = "success";
                response.result = result;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al obtener el carrito por ID - DAO: " + error.message;
        };
        return response;
    };

    // Traer todos los carritos - DAO: 
    async getAllCarts() {
        let response = {};
        try {
            const result = await cartModel.find();
            if (result.length === 0) {
                response.status = "not found carts";
            } else {
                response.status = "success";
                response.result = result;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al obtener todos los carritos - DAO: " + error.message;
        };
        return response;
    };

    // Agregar un producto a un carrito:
    async addProductToCart(cid, product, quantity) {
        let response = {};
        try {
            const cart = await this.getCartById(cid);
            if (cart.result === null) {
                response.status = "not found cart";
            } else {
                const productID = product._id.toString();
                const existingProductIndex = cart.result.products.findIndex(p => p.product._id.toString() === productID);
                if (existingProductIndex !== -1) {
                    // Si el producto ya está en el carrito, solo se actualiza el quantity.
                    cart.result.products[existingProductIndex].quantity += parseInt(quantity, 10);
                    await cart.result.save();
                    response.status = "success";
                    response.result = cart;
                } else {
                    // Si el producto no está en el carrito, se lo agregar con el quantity proporcionado.
                    cart.result.products.push({
                        product: product,
                        quantity: quantity
                    });
                    await cart.result.save();
                    response.status = "success";
                    response.result = cart;
                };
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al agregar el producto al carrito - DAO: " + error.message;
        };
        return response;
    };

    // Agregar un ticket a un carrito - DAO:
    async addTicketToCart(cid, ticketID) {
        let response = {};
        try {
            const cart = await this.getCartById(cid);
            if (cart.result === undefined) {
                response.status = "not found cart";
            } else {
                cart.result.tickets.push({
                    ticketsRef: ticketID
                });
                await cart.result.save();
                response.status = "success";
                response.result = cart;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al agregar el ticket al carrito - DAO: " + error.message;
        };
        return response;
    };

    // Borrar un producto de un carrito: 
    async deleteProductFromCart(cid, pid) {
        let response = {};
        try {
            const cart = await this.getCartById(cid);
            if (cart.result === null) {
                response.status = "not found cart";
            } else {
                const product = cart.result.products.find((p) => p._id.toString() === pid);
                if (product === undefined) {
                    response.status = "not found product";
                } else {
                    cart.result.products.pull(pid);
                    await cart.result.save();
                    response.status = "success";
                    response.result = cart;
                };
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al borrar el producto en carrito - DAO: " + error.message;
        };
        return response;
    };

    // Eliminar todos los productos de un carrito: 
    async deleteAllProductsFromCart(cid) {
        let response = {};
        try {
            const cart = await this.getCartById(cid);
            if (cart.result === null) {
                response.status = "not found cart";
            } else if (cart.status === "success") {
                if (cart.result.products.length === 0) {
                    response.status = "not found prod";
                } else {
                    cart.result.products = [];
                    await cart.result.save();
                    response.status = "success";
                    response.result = cart.result;
                }
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al eliminar todos los productos del carrito - DAO: " + error.message;
        };
        return response;
    };

    // Actualizar un carrito - DAO:
    async updateCart(cid, updatedCartFields) {
        let response = {};
        try {
            // Obtener el carrito actual:
            const currentCart = await this.getCartById(cid);

            // IDs de los productos en el carrito, actualmente:
            const productIdsCart = currentCart.result.products.map((product) => product.product._id.toString());

            // Extraemos los productos enviados para actualizar: 
            const {
                products: productsUp,
                ...restOfCartFields
            } = updatedCartFields;

            // Verificamos si todos los productos enviados ya existen en el carrito y tienen la misma cantidad:
            const allProductsExistWithSameQuantity = productsUp.every((productUp) => {
                // Buscamos cada producto en el carrito:
                const productIndex = productIdsCart.indexOf(productUp.product);
                if (productIndex !== -1) {
                    // Si el producto ya se encuentra en el carrito, entocnes comparamos su quantity actual con el nuevo:
                    return currentCart.result.products[productIndex].quantity === productUp.quantity;
                }
                return false;
            });

            // Si allProductsExistWithSameQuantity es true significa que los productos ya están en el carrito con la misma cantidad, no es necesario realizar la actualización. Si es false significa que hay productos diferentes o con diferente cantidad, por ende, se procede con la actualización:
            if (allProductsExistWithSameQuantity) {
                response.status = "update is equal to current";
            } else {
                const cart = await cartModel.updateOne({
                    _id: cid
                }, {
                    $set: updatedCartFields
                });
                if (cart.matchedCount === 0) {
                    response.status = "not found cart";
                } else if (cart.matchedCount === 1) {
                    response.status = "success";
                    response.result = cart;
                }
            }

        } catch (error) {
            response.status = "error";
            response.message = "Error al actualizar el carrito - DAO: " + error.message;
        };
        return response;
    };

    // Actualizar la cantidad de un produco en carrito - DAO: 
    async updateProductInCart(cid, pid, quantity) {
        let response = {};
        try {
            const cart = await this.getCartById(cid);
            if (cart.result === null) {
                response.status = "not found cart";
            } else {
                const product = cart.result.products.find((p) => p._id.toString() === pid);
                if (product === undefined) {
                    response.status = "not found product";
                } else {
                    if (product.quantity === quantity) {
                        response.status = "update is equal to current";
                    } else {
                        product.quantity = quantity;
                        await cart.result.save();
                        response.status = "success";
                        response.result = {
                            productId: pid,
                            newQuantity: product.quantity
                        };
                    };
                };
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al actualizar el producto en el carrito - DAO: " + error.message;
        };
        return response;
    };

};