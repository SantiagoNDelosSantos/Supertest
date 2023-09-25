import dotenv from "dotenv";
import { Command } from "commander";

const program = new Command();

program.option('--mode <mode>', 'mode en que se levantara la app', 'dev')

program.parse()

const mode = program.opts().mode 

dotenv.config({
    path: mode == 'dev' ? '.env.development' : '.env.production'
})

// Exporto las variables de entorno: 

// Entorno: 
export const envEntorno = process.env.ENVIRONMENT;

// MongoDB
export const envMongoURL = process.env.MONGO_URL;
export const envPort = process.env.PORT;

// GitHub:
export const envClientID = process.env.CLIENT_ID;
export const envClientSecret = process.env.CLIENT_SECRET;
export const envCallbackURL = process.env.CALLBACK_URL;

// JWT:
export const envCoderSecret = process.env.CODER_SECRET;
// Nombre de la cookie con el jwt token: 
export const envCoderTokenCookie = process.env.CODER_COOKIE;

// Nombre de la cookie para enviar el ID del usuario creado con la estrategia de GitHub, al formulario extra:
export const envCoderUserIDCookie = process.env.CODER_USER;

// Firma de Cookies:
export const envCookieParser = process.env.FIRMA_COOKIE;

// ADMIN:
export const envAdminEmailCoder = process.env.ADMIN_EMAIL;
export const envAdminPassCoder = process.env.ADMIN_PASSWORD;

// Nodemailer:
export const envServiceTransport = process.env.SERVICE_TRANSPORT;
export const envPortTransport = process.env.PORT_TRANSPORT;
export const envAuthUserTransport = process.env.AUTH_USER_TRANSPORT;
export const envAuthPassTransport = process.env.AUTH_PASS_TRANSPORT;

// Token para el link de restablecer contraseña:
export const envResetPassToken = process.env.RESET_PASSWORD_TOKEN;

console.log(program.opts())

// Cargar variables de entorno, antes de levantar el servidor: 
// npm run dev-D : npm run dev-P