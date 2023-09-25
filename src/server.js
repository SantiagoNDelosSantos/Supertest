// Imports de paquetes y módulos
import express, { urlencoded } from 'express';
import mongoose from 'mongoose';
import handlebars from "express-handlebars";
import __dirname from './utils.js';
import { Server } from 'socket.io';

// Imports de rutas:
import cartRouter from './routes/cart.router.js';
import msmRouter from './routes/message.router.js';
import productsRouter from './routes/products.router.js';
import sessionRouter from './routes/session.router.js'
import viewsRouter from "./routes/views.router.js";
import ticketRouter from "./routes/ticket.router.js";
import mockRouter from './routes/mock.router.js'
import loggerRouter from './routes/loggerTest.router.js'

// Import de controladores: 
import ViewsController from './controllers/viewsController.js';

// Import cookies:
import cookieParser from 'cookie-parser';

// Imports de configuraciones de Passport:
import passport from 'passport';
import { initializePassportLocal } from './config/local.passport.js';
import { initializePassportGitHub } from './config/gitHub.passport.js';
import { initializePassportJWT } from './config/jwt.passport.js';

// Import variables de entorno:
import { envMongoURL, envPort, envCookieParser } from './config.js';

// Import middleware para errores:
import { errorMiddleware } from './errors/error.middleware.js'

// Import logs:
import { logger, addLogger } from './logs/logger.config.js';

// Imports Swagger:
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

// Iniciamos el servidor Express:
const app = express();

// Conexión Mongoose: 
const connection = mongoose.connect(envMongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Configuración de Middlewares
app.use(express.json());
app.use(urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/public'));
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');
app.use(addLogger);

// Inicialización de Passport:
app.use(cookieParser(envCookieParser));
initializePassportLocal();
initializePassportJWT();
initializePassportGitHub();
app.use(passport.initialize());

// Configuración de Swagger: 
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Documentación eCommerce - Global Technology',
            description: 'Esta documentación corresponde al proyecto de eCommerce desarrollado por el alumno Santiago N. De los Santos como parte del curso de Backend de CoderHouse. A continuación, se presenta una descripción detallada de los modulos "products" y "carts.'
        },
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
}
const specs = swaggerJSDoc(swaggerOptions)

// Inicialización de Swagger:
app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

// Creamos el servidor HTTP con Express:
const expressServer = app.listen(envPort, () => {
    logger.info(`Servidor iniciado en el puerto ${envPort}.`);
});

// Creamos el servidor Socket.io escuchando el servidor HTTP:
const socketServer = new Server(expressServer);

// Controlador vistas: 
let viewsController = new ViewsController();

// Eventos y acciones para el servidor Socket.io:
socketServer.on("connection", async (socket) => {

    // Mensaje de nuevo cliente conectado:
    logger.info("¡Nuevo cliente conectado!", socket.id)

    // PRODUCTOS:

    // Envío de todos los productos en tiempo real:
    const productsResponse = await viewsController.getAllProductsControllerV();

    socket.emit('products', productsResponse.result);

    // Recibo los filtros de main.js en busquedaProducts:
    socket.on('busquedaFiltrada', async (busquedaProducts) => {
        const {
            limit,
            page,
            sort,
            filtro,
            filtroVal
        } = busquedaProducts;
        const productsResponse = await viewsController.getAllProductsControllerV(limit, page, sort, filtro, filtroVal);
        socket.emit('products', productsResponse.result);
    });

    // MESSAGES: 

    // Enviamos todos los mensajes al usuario:
    const messages = await viewsController.getAllMessageControllerV();
    socket.emit("messages", messages.result);
    
});

// Middleware para acceder al servidor Socket.io desde las rutas:
app.use((req, res, next) => {
    req.socketServer = socketServer;
    next()
});

// Rutas:
app.use('/api/carts/', cartRouter);
app.use('/api/chat/', msmRouter);
app.use('/api/products', productsRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/tickets', ticketRouter);
app.use('/', viewsRouter);
app.use('/mockProducts', mockRouter);
app.use('/loggerTest', loggerRouter);

// Middleware Error:
app.use(errorMiddleware);