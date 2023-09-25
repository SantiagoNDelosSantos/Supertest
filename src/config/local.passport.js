// Import passport - local pasport:
import passport from 'passport';
import local from 'passport-local';

// Import createHash - isValidPassword: 
import {
    createHash,
    isValidPassword
} from "../utils.js";

// Import UserController:
import SessionController from '../controllers/sessionController.js'

// Import CartController:
import CartController from '../controllers/cartController.js';

// Import email y contraseña admin:
import {
    envAdminEmailCoder,
    envAdminPassCoder
} from '../config.js';

// Instancia de localStrategy: 
const localStrategy = local.Strategy;

// Instancia de SessionController: 
let sessionController = new SessionController();

// Instancia de CartController: 
let cartController = new CartController();

// Función de PassportLocal para exportarla:
export const initializePassportLocal = (req, res) => {

    // Primera estrategia - Registro:

    passport.use('register', new localStrategy({
            passReqToCallback: true,
            usernameField: 'email'
        },

        async (req, username, password, done) => {

            // Sacamos del body del formulario toda la informacion del usuario: 
            const {
                first_name,
                last_name,
                age,
                email
            } = req.body;

            try {

                // Buscamos el correo en la base de datos: 
                const existSessionControl = await sessionController.getUserByEmailOrNameOrIdController(req, res, username);

                // Verificamos si no hubo algun error en el módulo de session, si lo hubo devolvemos el mensaje de error:
                if (existSessionControl.statusCode === 500) {
                    return done(null, false, {
                        statusCode: 500,
                        message: existSessionControl.message
                    });
                }

                // Verificamos si el usuario ya esta registrado, en dicho caso le decimos que vaya al login:
                else if (existSessionControl.statusCode === 200) {
                    return done(null, false, {
                        statusCode: 409,
                        message: 'Ya existe una cuenta asociada a este correo. Presione en "Ingresa aquí" para iniciar sesión.'
                    });
                }

                // Si el usuario no esta registrado en la base de datos (404), entonces se procede al registro: 
                else if (existSessionControl.statusCode === 404) {

                    // Creamos un carrito para el usuario: 
                    const resultCartControl = await cartController.createCartController(req, res);

                    // Validamos si no hubo algun error en el  módulo de cart, si lo hubo devolvemos el mensaje de error:
                    if (resultCartControl.statusCode === 500) {
                        return done(null, false, {
                            statusCode: 500,
                            message: resultCartControl.message
                        });
                    }

                    // Si no hubo error en el  módulo de cart continuamos con el registro:
                    else if (resultCartControl.statusCode === 200) {

                        // Extraemos solo el carrito creado por el cartController: 
                        const cart = resultCartControl.result;

                        // Creamos el objeto con los datos del usuario y le añadimos el _id de su carrito: 
                        const newUser = {
                            first_name,
                            last_name,
                            email,
                            age,
                            password: createHash(password),
                            role: 'user',
                            cart: cart._id,
                        };

                        // Creamos el nuevo usuario:
                        const createSessionControl = await sessionController.createUserControler(req, res, newUser);

                        // Verificamos si no hubo algun error en el  módulo de session, si lo hubo devolvemos el mensaje de error:
                        if (createSessionControl.statusCode === 500) {
                            return done(null, false, {
                                statusCode: 500,
                                message: createSessionControl.message
                            });
                        }

                        // Si no hubo error en el  módulo de session se crea el nuevo usuario y se finaliza el registro:
                        else if (createSessionControl.statusCode === 200) {
                            const user = createSessionControl.result;
                            return done(null, user, {
                                statusCode: 200,
                            });
                        }
                    }
                };
            } catch (error) {
                req.logger.error(error)
                return done(null, false, {
                    statusCode: 500,
                    message: 'Error de registro en local.passport.js - Register: ' + error.message
                });
            };
        }
    ));

    // Segunda estrategia - Login:

    passport.use('login', new localStrategy({
            passReqToCallback: true,
            usernameField: 'email'
        },

        async (req, username, password, done) => {

            try {

                // Verificar si el usuario es administrador
                if (username === envAdminEmailCoder && password === envAdminPassCoder) {
                    let userAdmin = {
                        first_name: "Admin",
                        last_name: "X",
                        email: envAdminEmailCoder,
                        age: 0,
                        password: envAdminPassCoder,
                        role: "admin",
                        cart: null,
                    };
                    return done(null, userAdmin, { statusCode: 200 });
                }

                // Si no es admin procedemos a logueo del usuario:
                else {

                    // Buscamos el correo en la base de datos: 
                    const existDBSessionControl = await sessionController.getUserByEmailOrNameOrIdController(req, res, username);

                    // Verificamos si no hubo algun error en el  módulo de session, si lo hubo devolvemos el mensaje de error:
                    if (existDBSessionControl.statusCode === 500) {
                        return done(null, false, {
                            statusCode: 500,
                            message: existDBSessionControl.message
                        });
                    }

                    // Si el usuario no esta registrado en la base de datos (404), entocnes le decimos que se registre: 
                    else if (existDBSessionControl.statusCode === 404) {
                        return done(null, false, {
                            statusCode: 404,
                            message: 'No existe una cuenta asociada a este correo. Presione en "Regístrarse aquí" para crear una cuenta.'
                        });
                    }

                    // Verificamos si el usuario ya esta registrado, osea si ya hay una cuenta con el correo proporcionado:
                    else if (existDBSessionControl.statusCode === 200) {

                        // Extraermos solo el resultado:
                        const user = existDBSessionControl.result;

                        // Si el usuario existe en la base de datos, verificamos que la contraseña sea válida:
                        if (!isValidPassword(user, password)) {
                            return done(null, false, {
                                statusCode: 409,
                                message: 'Existe una cuenta asociada a este correo pero, la contraseña ingresada es incorrecta.'
                            });
                        } else {
                            // Si el usuario existe y la contraseña es correcta, retornar el usuario autenticado:
                            return done(null, user, { statusCode: 200 });
                        }
                    }
                }
            } catch (error) {
                console.log(error)
                req.logger.error(error)
                return done(null, false, {
                    statusCode: 500,
                    message: 'Error de login en local.passport.js - Login: ' + error.message
                });
            };
        }))

};