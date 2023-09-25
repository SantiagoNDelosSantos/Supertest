import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';

// Bcrypt:

// Crea un hash a partir de una contraseña utilizando bcrypt.
export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

// Comprueba si una contraseña coincide con el hash almacenado en el usuario.
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

// Dirname:

// Obtener el nombre de archivo y el nombre de directorio actual usando 'import.meta.url':
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Exportar el nombre de directorio actual (__dirname) para usarlo en otras partes del proyecto:
export default __dirname;