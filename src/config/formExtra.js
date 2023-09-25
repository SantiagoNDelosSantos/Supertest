import jwt from 'jsonwebtoken';
import {
    envCoderSecret,
    envCoderTokenCookie, envCoderUserIDCookie
} from '../config.js';

// Import createHash: 
import {
    createHash
} from "../utils.js";

// Import UserController:
import SessionController from '../controllers/sessionController.js';

// Instancia de SessionController: 
let sessionController = new SessionController();

// Función para completeProfile: 
export const completeProfile = async (req, res) => {

    // Obtenemos la cookie con el ID del usuario base creado con los datos de GitHub: 
    const userId = req.signedCookies[envCoderUserIDCookie]

    const last_name = req.body.last_name;
    const email = req.body.email;
    const age = req.body.age;
    const password = createHash(req.body.password);

    try {

        // Crear el objeto con los datos del formulario extra, para actualizar al usuario creado con los datos de GitHub:
        const updateUser = {
            last_name,
            email,
            age,
            password
        };

        // Actualizar el usuario en la base de datos:
        const updateSessionControl = await sessionController.updateUserController(req, res, userId, updateUser);

        // Si se encuantra el usuario lo actualizamos:
        if (updateSessionControl.statusCode === 200) {

            // Extraermos solo el resultado:
            const userExtraForm = updateSessionControl.result;

            // Generar el token JWT:
            let token = jwt.sign({
                email: userExtraForm.email,
                first_name: userExtraForm.first_name,
                role: userExtraForm.role,
                cart: userExtraForm.cart,
                userID: userExtraForm._id
            }, envCoderSecret, {
                expiresIn: '7d'
            });
            // Token jwt: 
            res.cookie(envCoderTokenCookie, token, {
                httpOnly: true,
                signed: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            // Redirigir al usuario a la vista de productos:
            res.send({
                status: 'success',
                redirectTo: '/products'
            });
        };
        
    } catch (error) {
        req.logger.error(error.message)
        return ('Error al completar el perfil del usuario creado con GitHub - formExtra.js: ' + error.message);
    };

};