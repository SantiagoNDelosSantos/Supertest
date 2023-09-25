// Import mongoose para el mongoose.connect:
import mongoose from "mongoose";

// Import del modelo de productos:
import {
    userModel
} from './models/users.model.js'

// Importación de variables de entorno: 
import {
    envMongoURL
} from "../../config.js";

// Clase para el DAO de sesiones/usuarios:
export default class SessionDAO {

    // Conexión Mongoose:
    connection = mongoose.connect(envMongoURL);

    // Crear usuario - DAO: 
    async createUser(info) {
        let response = {};
        try {
            const result = await userModel.create(info);
            response.status = "success";
            response.result = result;
        } catch (error) {
            response.status = "error";
            response.message = "Error al registrar al usurio - DAO: " + error.message;
        };
        return response;
    };

    // Buscar usuario por email, nombre de usuario o id - DAO:
    async getUserByEmailOrNameOrId(identifier) {
        let response = {};
        try {
            const conditions = [{ email: identifier }, { first_name: identifier } ];
            if (mongoose.Types.ObjectId.isValid(identifier)) { conditions.push({ _id: identifier });
            }
            const result = await userModel.findOne({ $or: conditions });
            if (result === null) {
                response.status = "not found user";
            } else {
                response.status = "success";
                response.result = result;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al obtener el usuario - DAO. Error original: " + error.message;
        };
        return response;
    };

    // Actualizar usuario - DAO:
    async updateUser(uid, updateUser) {
        let response = {};
        try {
            let result = await userModel.updateOne({_id: uid }, { $set: updateUser });
            if (result.matchedCount === 0) {
                response.status = "not found user";
            } else if (result.matchedCount === 1){
                let userUpdate = await userModel.findOne({  _id: uid });
                response.status = "success";
                response.result = userUpdate;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al actualizar los datos del usuario - DAO: " + error.message;
        };
        return response;
    };

};