// Import clase del DAO de carritos:
import CartDAO from "../DAO/mongodb/CartMongo.dao.js";

// Import de ProductService para acceder a productos desde los carritos:
import ProductService from "./products.service.js";

// Import TicketsService:
import TicketService from "./tickets.service.js";

// Clase para el Service de carrito:
export default class CartService {

    // Constructor de CartService:
    constructor() {
        this.cartDao = new CartDAO();
        this.productService = new ProductService();
        this.ticketService = new TicketService();
    }

    // Métodos de CartService:

    // Crear un carrito - Service:
    async createCartService() {
        let response = {};
        try {
            const resultDAO = await this.cartDao.createCart();
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carrito creado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al crear el carrito - Service: " + error.message;
        };
        return response;
    };

    // Traer un carrito por su ID - Service:
    async getCartByIdService(cid) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.getCartById(cid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carrito obtenido exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener el carrito por ID - Service: " + error.message;
        };
        return response;
    };

    // Traer todos los carritos - Service:
    async getAllCartsService() {
        let response = {};
        try {
            const resultDAO = await this.cartDao.getAllCarts();
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found carts") {
                response.statusCode = 404;
                response.message = "No se han encontrado carritos.";
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carritos obtenidos exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener los carritos - Service: " + error.message;
        };
        return response;
    };

    // Agregar un producto a un carrito - Service:
    async addProductToCartService(cid, pid, quantity, userId) {
        let response = {}
        try {
            const product = await this.productService.getProductByIdService(pid);
            if (product.statusCode === 500 || product.statusCode === 404) {
                response.statusCode = product.statusCode;
                response.message = product.message;
            } else {
                if (product.result.owner === "admin" || !product.result.owner === userId) {
                    // Si el owner es undefined (Sigfinica que fue creado por un admin) o si el producto no pertenece al user, en ambos casos se puede agregar el producto al carrito: 
                    const resultDAO = await this.cartDao.addProductToCart(cid, product.result, quantity);
                    if (resultDAO.status === "error") {
                        response.statusCode = 500;
                        response.message = resultDAO.message;
                    } else if (resultDAO.status === "not found cart") {
                        response.statusCode = 404;
                        response.message = `No se encontró ningún carrito con ID ${cid}.`;
                    } else if (resultDAO.status === "success") {
                        response.statusCode = 200;
                        response.message = "Producto agregado al carrito exitosamente.";
                        response.result = resultDAO.result;
                    };
                } else if (product.result.owner === userId) {
                    // Si el producto pertenece al user, no se le permite agregar el producto a su carrito: 
                    response.statusCode = 403;
                    response.message = "No puedes agregar tus propios productos a tu carrito.";
                }
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al agregar el producto al carrito - Service: " + error.message;
        };
        return response;
    };

    // Procesamiento de la compra del usuario:
    async purchaseProductsInCartService(cartID, purchaseInfo, userEmail) {

        let response = {};

        try {

            // Creamos un arreglo para los productos que se pueden comprar y aquellos que nos, al igual que una variable para para guardar el valor total de la compra: 
            const successfulProducts = [];
            const failedProducts = [];
            let totalAmount = 0;

            // Separamos los productos que se pueden comprar de aquellos que no y calculamos el total de la compra: 
            for (const productInfo of purchaseInfo.products) {
                // Obtener el _id del producto en la base de datos:
                const databaseProductID = productInfo.databaseProductID;
                // Obtener la cantidad que se desea comprar de ese producto: 
                const quantityToPurchase = productInfo.quantity;
                // Obtenemos cada producto por su ID en la base de datos
                const productFromDB = await this.productService.getProductByIdService(databaseProductID);
                // Se agrega al array de productos fallidos, los productos no encontrados y aquellos en que el productService haya devuelto error:   
                if (productFromDB.statusCode === 404 || productFromDB.statusCode === 500) {
                    failedProducts.push(productInfo);
                    continue;
                }
                // Se agrega al array de productos fallidos, aquellos cuyo stock sea menor al quantity que se desea comprar:
                else if (productFromDB.result.stock < quantityToPurchase) {
                    failedProducts.push(productInfo);
                    continue;
                }
                // Si el stock del producto es mayor o igual al quantity que se desea comprar, se agrega al agreglo de productos que sí se pueden comprar (El frontend no permite selecionar menos de 1 Und. como quantity): 
                else if (productFromDB.result.stock >= quantityToPurchase) {
                    successfulProducts.push(productInfo);
                    totalAmount += productFromDB.result.price * quantityToPurchase;
                    continue;
                };
            };

            for (const productInfo of successfulProducts) {
                // Obtenemos el _id del producto en la base de datos:
                const databaseProductID = productInfo.databaseProductID;
                // Extraemos la cantidad a comprar de ese producto:     
                const quantityToPurchase = productInfo.quantity;
                // Buscamos el producto por su ID en la base de datos:
                const productFromDB = await this.productService.getProductByIdService(databaseProductID);
                // Restamos del stock del producto la cantidad comprada:
                const updatedProduct = {
                    stock: productFromDB.result.stock - quantityToPurchase
                };
                // Enviamos el nuevo stock al productService, para actualizar el stock del producto: 
                await this.productService.updateProductService(databaseProductID, updatedProduct);
                // Eliminamos del carrito los productos que se pudieron comprar usando el ID que tiene el producto en el carrito:
                await this.deleteProductFromCartService(cartID, productInfo.cartProductID);
            };

            // Creamos la estructura del ticket con todos los productos de la compra, tanto comprados como aquellos fallidos: 
            const ticketInfo = {
                successfulProducts: successfulProducts.map(productInfo => ({
                    product: productInfo.databaseProductID,
                    quantity: productInfo.quantity,
                    title: productInfo.title,
                    price: productInfo.price,
                })),
                failedProducts: failedProducts.map(productInfo => ({
                    product: productInfo.databaseProductID,
                    quantity: productInfo.quantity,
                    title: productInfo.title,
                    price: productInfo.price,
                })),
                purchase: userEmail,
                amount: totalAmount
            };
            // Enviamos la estructura al ticketService para crear al el tickect: 
            const ticketServiceResponse = await this.ticketService.createTicketService(ticketInfo);
            // Si hay un error en la creación del ticket lo devolvemos: 
            if (ticketServiceResponse.statusCode === 500) {
                response.statusCode = 500;
                response.message = ticketServiceResponse.message;
            }
            // Si el ticket se crea correctamente, continuamos: 
            else if (ticketServiceResponse.statusCode === 200) {
                // Obtenemos el ID del ticket:
                const ticketID = ticketServiceResponse.result._id;
                // Enviamos el ID del carrito y el ID el ticket para agregar el ticket al carrito:
                const resultDAO = await this.cartDao.addTicketToCart(cartID, ticketID);
                if (resultDAO.status === "not found cart") {
                    response.statusCode = 404;
                    response.message = `No se encontró ningún carrito con el ID ${cartID}.`;
                } else if (resultDAO.status === "error") {
                    response.statusCode = 500;
                    response.message = resultDAO.message;
                } else if (resultDAO.status === "success") {
                    response.statusCode = 200;
                    response.message = "Compra procesada exitosamente. El ticket ya ha sido agregado al carrito.";
                    response.result = ticketServiceResponse.result;
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = 'Error al procesar la compra - Service: ' + error.message;
        };
        return response;
    };

    // Eliminar un producto de un carrito: 
    async deleteProductFromCartService(cid, pid) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.deleteProductFromCart(cid, pid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontró ningún producto con el ID ${pid}, en el carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Producto eliminado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al borrar el producto en carrito - Service: " + error.message;
        };
        return response;
    };

    // Eliminar todos los productos de un carrito - Service: 
    async deleteAllProductFromCartService(cid) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.deleteAllProductsFromCart(cid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "not found prod") {
                response.statusCode = 404;
                response.message = `No se encontraron productos en el carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Los productos del carrito se han eliminado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar todos los productos del carrito - Service: " + error.message;
        };
        return response;
    };

    // Actualizar un carrito - Service:
    async updateCartService(cid, updatedCartFields) {
        const response = {};
        try {
            const resultDAO = await this.cartDao.updateCart(cid, updatedCartFields)
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "update is equal to current") {
                response.statusCode = 409;
                response.message = `La actualización es igual a la versión actual de los datos del carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carrito actualizado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el carrito - Service: " + error.message;
        };
        return response;
    };

    // Actualizar la cantidad de un producto en carrito - Service:
    async updateProductInCartService(cid, pid, quantity) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.updateProductInCart(cid, pid, quantity)
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontró ningún producto con el ID ${pid}, en el carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "update is equal to current") {
                response.statusCode = 409;
                response.message = `La actualización es igual a la versión actual de los datos del carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Producto actualizado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el producto en el carrito - Service: " + error.message;
        };
        return response;
    };

};