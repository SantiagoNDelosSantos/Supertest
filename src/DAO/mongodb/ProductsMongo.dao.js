// Import mongoose para el mongoose.connect:
import mongoose from "mongoose";

// Import del modelo de productos:
import {
    productsModel
} from "./models/products.model.js";

// Importación de variables de entorno:
import {
    envMongoURL
} from "../../config.js";

// Clase para el DAO de productos:
export default class ProductsDAO {

    // Conexión Mongoose:
    connection = mongoose.connect(envMongoURL);

    // Crear producto - DAO:
    async createProduct(info) {
        let response = {};
        try {
            const result = await productsModel.create(info);
            response.status = "success";
            response.result = result;
        } catch (error) {
            response.status = "error";
            response.message = "Error al crear el producto - DAO: " + error.message;
        };
        return response;
    };

    // Traer un producto por su ID - DAO:
    async getProductById(pid) {
        let response = {};
        try {
            const result = await productsModel.findOne({ _id: pid });
            if (result === null) {
                response.status = "not found product";
            } else {
                response.status = "success";
                response.result = result;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al obtener el producto por ID - DAO: " + error.message;
        };
        return response;
    };

    // Traer todos los productos - DAO:
    async getAllProducts(limit = 10, page = 1, sort = 1, filtro = null, filtroVal = null) {
        let response = {};
        try {
            let whereOptions = {};
            if (filtro != '' && filtroVal != '') {
                whereOptions = {
                    [filtro]: filtroVal
                };
            };
            let result = {};
            if (sort !== 1) {
                result = await productsModel.paginate(whereOptions, {
                    limit: limit,
                    page: page,
                    sort: {
                        price: sort
                    },
                });
            } else {
                result = await productsModel.paginate(whereOptions, {
                    limit: limit,
                    page: page,
                });
            }
            const hasNextPage = result.page < result.totalPages;
            if (result.docs.length === 0) {
                response.status = "not found products";
            } else {
                response.status = "success";
                response.result = {
                    products: result,
                    hasNextPage: hasNextPage
                };
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al obtener los productos - DAO: " + error.message;
        };
        return response;
    };

    // Eliminar un producto por su ID - DAO:
    async deleteProduct(pid) {
        let response = {};
        try {
            const result = await productsModel.deleteOne({
                _id: pid
            });
            if (result.deletedCount === 0) {
                response.status = "not found product";
            } else if (result.deletedCount === 1) {
                response.status = "success";
                response.result = result;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al eliminar el producto - DAO: " + error.message;
        };
        return response;
    };

    // Actualizar un producto - DAO:
    async updateProduct(pid, updateProduct) {
        let response = {};
        try {
            const result = await productsModel.updateOne({  _id: pid }, {  $set: updateProduct });
            if (result.matchedCount === 0) {
                response.status = "not found product";
            } else if (result.matchedCount === 1) {
                if(result.modifiedCount === 0){
                    response.status = "update is equal to current";
                } else if (result.modifiedCount === 1) {
                    response.status = "success";
                    response.result = result;
                }
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al actualizar el producto - DAO: " + error.message;
        };
        return response;
    };

};