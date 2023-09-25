// Import mongoose para mongoose.connect:
import mongoose from "mongoose";

// Import del modelo de mensajes:
import {
    messageModel
} from "./models/messages.model.js";

// Importación de varibles de entorno: 
import {
    envMongoURL
} from "../../config.js";

// Clase para el DAO de mensajes: 
export default class MessageDAO {

    // Conexión Mongoose:
    connection = mongoose.connect(envMongoURL);

    // Crear un mensaje - DAO:
    async createMessage(message) {
        let response = {};
        try {
            const result = await messageModel.create(message);
            response.status = "success";
            response.result = result;
        } catch (error) {
            response.status = "error";
            response.message = "Error al crear el mensaje - DAO: " + error.message;
        };
        return response;
    };

    // Traer todos los mensajes - DAO: 
    async getAllMessage() {
        let response = {};
        try {
            let result = await messageModel.find().lean();
            if (result.length === 0) {
                response.status = "not found messages";
                response.result = result;
            } else {
                response.status = "success";
                response.result = result;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al obtener los mensajes - DAO: " + error.message;
        };
        return response;
    };

    // Borrar un mensaje - DAO:
    async deleteMessage(mid) {
        let response = {};
        try {
            let result = await messageModel.deleteOne({
                _id: mid
            });
            if (result.deletedCount === 0) {
                response.status = "not found message";
            } else if (result.deletedCount === 1) {
                response.status = "success";
                response.result = result;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al eliminar el mensaje - DAO: " + error.message;
        };
        return response;
    };

};