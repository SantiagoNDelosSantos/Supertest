// Import clase del DAO de productos: 
import ProductsDAO from "../DAO/mongodb/ProductsMongo.dao.js";

// Clase para el Service de productos: 
export default class ProductService {

    // Constructor de ProductService:
    constructor() {
        this.productDao = new ProductsDAO();
    }

    // Métodos de ProductService:

    // Crear producto - Service:
    async createProductService(info) {
        let response = {};
        try {
            const resultDAO = await this.productDao.createProduct(info);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Producto creado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al crear el producto - Service: " + error.message;
        };
        return response;
    };

    // Traer un producto por su ID - Service:
    async getProductByIdService(pid) {
        let response = {};
        try {
            const resultDAO = await this.productDao.getProductById(pid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontró ningún producto con el ID ${pid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Producto obtenido exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener el producto por ID - Service: " + error.message;
        };
        return response;
    };

    // Traer todos los productos - Service: 
    async getAllProductsService(limit, page, sort, filtro, filtroVal) {
        let response = {};
        try {
            const resultDAO = await this.productDao.getAllProducts(limit, page, sort, filtro, filtroVal);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found products") {
                response.statusCode = 404;
                response.message = `No se encontraron productos. El resultado fue de ${resultDAO.result.products.docs.length} productos.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Productos obtenidos exitosamente.";
                response.result = resultDAO.result.products;
                response.hasNextPage = resultDAO.result.hasNextPage;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener los productos - Service: " + error.message;
        };
        return response;
    };

    // Eliminar un producto por su ID - Service:
    async deleteProductService(pid, owner) {
        let response = {};
        try {
            const productInfo = await this.productDao.getProductById(pid);
            if (productInfo.status === "error") {
                response.statusCode = 500;
                response.message = productInfo.message;
            } else if (productInfo.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontró ningún producto con el ID ${pid}.`;
            } else if (productInfo.status === "success") {
                if (owner === "admin" || productInfo.result.owner === owner) {
                    // Si el owner es admin o uindefined (Todos los productos antes de esta integración no tienen campo owner) puede eliminar cualquier producto. En el caso del user premium este solo puede eliminar los productos que le pertenezcan: 
                    const resultDAO = await this.productDao.deleteProduct(pid);
                    if (resultDAO.status === "error") {
                        response.statusCode = 500;
                        response.message = resultDAO.message;
                    } else if (resultDAO.status === "not found product") {
                        response.statusCode = 404;
                        response.message = `No se encontró ningún producto con el ID ${pid}.`;
                    } else if (resultDAO.status === "success") {
                        
                        response.statusCode = 200;
                        response.message = "Producto eliminado exitosamente.";
                        response.result = resultDAO.result;
                    };
                } else {
                    // Si el user premium intenta eliminar un producto que no le pertenecer se le deniega la acción:
                    response.statusCode = 403;
                    response.message = "Solo puedes eliminar los productos que te pertenecen.";
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar el producto - Service: " + error.message;
        };
        return response;
    };

    // Actualizar un producto - Service: 
    async updateProductService(pid, updateProduct, owner) {
        let response = {};
        try {
            const productInfo = await this.productDao.getProductById(pid);
            if (productInfo.status === "error") {
                response.statusCode = 500;
                response.message = productInfo.message;
            } else if (productInfo.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontró ningún producto con el ID ${pid}.`;
            } else if (productInfo.status === "success") {
                if (owner === "admin" || productInfo.result.owner === owner) {
                    // Si el owner es admin o uindefined (Todos los productos antes de esta integración no tienen campo owner) puede actualizar cualquier producto. En el caso del user premium este solo puede actualizar los productos que le pertenezcan: 
                    const resultDAO = await this.productDao.updateProduct(pid, updateProduct);
                    if (resultDAO.status === "error") {
                        response.statusCode = 500;
                        response.message = resultDAO.message;
                    } else if (resultDAO.status === "not found product") {
                        response.statusCode = 404;
                        response.message = `No se encontró ningún producto con el ID ${pid}.`;
                    } else if (resultDAO.status === "update is equal to current") {
                        response.statusCode = 409;
                        response.message = 'La actualización es igual a la versión actual de los datos del producto.'
                    } else if (resultDAO.status === "success") {
                        response.statusCode = 200;
                        response.message = "Producto actualizado exitosamente.";
                        response.result = resultDAO.result;
                    };
                } else {
                    // Si el user premium que intenta actualizar un producto que no le pertenece se le deniega la actialización:
                    response.statusCode = 403;
                    response.message = "Solo puedes modificar los productos que te pertenecen.";
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el producto - Service: " + error.message;
        };
        return response;
    };

};