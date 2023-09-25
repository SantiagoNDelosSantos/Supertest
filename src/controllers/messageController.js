// Import de MessageService:
import MessageService from '../services/message.service.js'

// Import mongoose para validación de IDs: 
import mongoose from 'mongoose';

// Errores:
import ErrorEnums from "../errors/error.enums.js";
import CustomError from "../errors/customError.class.js";
import ErrorGenerator from "../errors/error.info.js";

// Clase para el Controller de mensajes: 
export default class MessageController {

    constructor() {
        // Instancia de MessageService: 
        this.messageService = new MessageService();
    }

    // Métodos para MessageController:

    // Crear un mensaje - Controler :
    async createMessageController(req, res, next) {
        const messageData = req.body;
        try {
            if (!messageData.user || typeof messageData.user === 'number' || !messageData.message) {
                CustomError.createError({
                    name: "Error al crear el mensaje.",
                    cause: ErrorGenerator.generateMessageDataErrorInfo(messageData),
                    message: "La información para crear el mensaje está incompleta o no es válida.",
                    code: ErrorEnums.INVALID_MESSAGE_DATA
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.messageService.createMessageService(messageData);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                // Actualización Real Time:
                const messages = await this.messageService.getAllMessageService();
                req.socketServer.sockets.emit('messages', messages.result)
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al crear el mensaje - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    // Traer todos los mensajes - Controller: 
    async getAllMessageController(req, res) {
        let response = {};
        try {
            const resultService = await this.messageService.getAllMessageService();
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
            response.message = "Error al obtener los mensajes - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    // Borrar un mensaje - Controller: 
    async deleteMessageController(req, res, next) {
        const mid = req.params.mid;
        try {
            if (!mid || !mongoose.Types.ObjectId.isValid(mid)) {
                CustomError.createError({
                    name: "Error al eliminar el mensaje.",
                    cause: ErrorGenerator.generateMidErrorInfo(mid),
                    message: "El ID de mensaje proporcionado no es válido.",
                    code: ErrorEnums.INVALID_MESSAGE_DATA
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.messageService.deleteMessageService(mid);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                // Actualización Real Time:
                const messages = await this.messageService.getAllMessageService();
                req.socketServer.sockets.emit('messages', messages.result);
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar el mensaje: - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

};