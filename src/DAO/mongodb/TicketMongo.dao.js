// Import mongoose para el mongoose.connect:
import mongoose from "mongoose";

// Import del modelo de ticket - Individual:
import {
    ticketModel
} from './models/ticket.model.js'

// Importación de variables de entorno: 
import {
    envMongoURL
} from "../../config.js";

// Clase para el DAO de tickets:
export default class TicketDAO {

    // Conexión Mongoose:
    connection = mongoose.connect(envMongoURL);

    // Crear ticket - DAO: 
    async createTicket(ticketInfo) {
        let response = {}
        try {
            const result = await ticketModel.create(ticketInfo);
            response.status = "success";
            response.result = result;
        } catch (error) {
            response.status = "error";
            response.message = "No se pudo crear el ticket - DAO: " + error.message;
        };
        return response;
    };

    // Obtener ticket por id de un usuario - DAO:
    async getTicketByID(tid) {
        let response = {}
        try {
            const result = await ticketModel.findOne({
                _id: tid
            });
            if (result === null) {
                response.status = "not found ticket";
            } else {
                response.status = "success";
                response.result = result;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al obtener el ticket por ID - DAO: " + error.message;
        };
        return response;
    };

};