import chai from "chai";
import supertest from "supertest";

// Import variables de entorno:
import {
    envPort
} from '../config.js';

// Import función de generateProducts:
import {
    generateProduct,
    generateUser
} from "../mocks/mock.config.js";

const expect = chai.expect;
const requester = supertest(`http://localhost:${envPort}`);

// Creamos un usuario de prueba (El correo se debe cambiar en cada ejecución de la prueba):
let userRegLog = generateUser();

// Guardamos los datos filtrados del usuurio ya creado: 
let currentUser;

// Cookie con el token de usuario:
let CoderCookie;

// Cookie con role premium:
let CoderCookiePremium;

// Creamos un producto de prueba: 
let productCreate = generateProduct()

// Gardamos el ID del producto ya creado:
let idProductCreateSuccess;

// ID de producto guardado en carrito: 
let idProdInCart;

describe('Test Global Technology', () => {

    describe('Test Session', () => {

        it('POST - /api/sessions/register (Debe crear al usuario en la DB, con todas sus propiedades)', async () => {

            // Enviamos el usuario de prueba a la ruta register:
            const result = await requester.post('/api/sessions/register').send(userRegLog);

            // Verificamos el estado de la response:
            expect(result.ok).to.be.ok;
            expect(result.statusCode).to.equal(200);

            // Verificamos que el usuario este completo: 
            expect(result.body.user).to.have.all.keys(
                'first_name',
                'last_name',
                'email',
                'age',
                'password',
                'role',
                'cart',
                '_id',
                '__v'
            );

        }).timeout(10000);

        it('POST - /api/sessions/login (Se debe loguear al usuario correctamente y generarse la cookie con su respectivo token)', async () => {

            // Extraemos del usaurio de prueba su correo y contraseña en userLog: 
            const userLog = {
                email: userRegLog.email,
                password: userRegLog.password
            };

            // Enviamos el userLog a la ruta de login: 
            const result = await requester.post('/api/sessions/login').send(userLog)

            // Verificamos el estado de la response:
            expect(result.ok).to.be.ok;
            expect(result.statusCode).to.equal(200);

            // Extraemos la cookie creada:
            const cookieResult = result.headers['set-cookie'][0];
            expect(cookieResult).to.be.ok;

            // Guardamos la cookie con su clave y valor en una variable "CoderCookie", para poder usarla en otras rutas:
            CoderCookie = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            };
            expect(CoderCookie.name).to.be.ok.and.equal('CoderCookie123');
            expect(CoderCookie.value).to.be.ok;

        }).timeout(10000);

        it('GET - /api/sessions/current (Se deben obtener los datos filtrados por el CurrentUserDTO)', async () => {

            // Enviamos la cookie a la ruta de current para que pueda acceder al token con datos del usuario:
            const result = await requester.get('/api/sessions/current').set('Cookie', [`${CoderCookie.name}=${CoderCookie.value}`]);

            // Verificamos que current devuelva los datos filtrados del usuario: 
            expect(result.body).to.have.all.keys(
                'name',
                'cart',
                'email',
                'userId',
                'role'
            );

            // Guardamos los datos del usuario en una variable "currentUser" para poder usar su información en otras rutas:
            currentUser = result.body;

        }).timeout(10000);

        it('POST - /api/sessions/premium/:uid (Se debe cambiar el role del usaurio a premium)', async () => {

            // Enviamos el ID del usuario a la ruta de cambio de role: 
            const result = await requester.post(`/api/sessions/premium/${currentUser.userId}`)

            // Verificamos el estado de la response:
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);
            expect(result.body.message).to.equal('Usuario actualizado exitosamente, su rol a sido actualizado a premium.');

            // Extraemos la cookie con el nuevo role del usaurio: 
            const newCookieResult = result.headers['set-cookie'][0];
            expect(newCookieResult).to.be.ok;

            // Guardamos la cookie con su clave y valor en una variable "CoderCookiePremium", para poder usarla en otras rutas:
            CoderCookiePremium = {
                name: newCookieResult.split('=')[0],
                value: newCookieResult.split('=')[1]
            };
            expect(CoderCookiePremium.name).to.be.ok.and.equal('CoderCookie123');
            expect(CoderCookiePremium.value).to.be.ok;

        }).timeout(10000);

    })

    describe('Test Products', () => {

        it('POST - /api/products/ (Se debe crear un producto exitosamente)', async () => {

            // Enviamos el producto de prueba:
            const result = await requester.post('/api/products/').set('Cookie', [`${CoderCookiePremium.name}=${CoderCookiePremium.value}`]).send(productCreate);

            // Verificamos el estado de la response:
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);

            // Verificamos que el producto se haya creado correctamente:
            expect(result.body.result).to.have.all.keys(
                "_id",
                'title',
                'description',
                'code',
                'price',
                'stock',
                'category',
                'thumbnails',
                "owner",
                "__v")

            // Guardamos en la variable idProductCreateSuccess el Id del producto: 
            idProductCreateSuccess = result.body.result._id;

        }).timeout(10000);

        it('PUT - /api/products/:pid (Se debe actualizar el producto exitosamente)', async () => {

            // Enviamos el ID del producto a la ruta Put:
            const result = await requester.put(`/api/products/${idProductCreateSuccess}`).set('Cookie', [`${CoderCookiePremium.name}=${CoderCookiePremium.value}`]).send({
                price: 1234
            })

            // Verificamos el estado de la response:
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);

            // Verificamos que el deleteCount sea mayor a 0:
            expect(result.body.result.modifiedCount).to.equal(1);

        }).timeout(10000);


        it('DELETE - /api/products/:pid (Se debe eliminar el producto exitosamente)', async () => {

            // Enviamos el ID del producto a la ruta Delete:
            const result = await requester.delete(`/api/products/${idProductCreateSuccess}`).set('Cookie', [`${CoderCookiePremium.name}=${CoderCookiePremium.value}`])

            // Verificamos el estado de la response:
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);

            // Verificamos que el deleteCount sea mayor a 0:
            expect(result.body.result.deletedCount).to.equal(1);

        }).timeout(10000);

    })

    describe('Test Carts', () => {

        it('POST - /api/carts/:cid/products/:pid/quantity/:quantity (Se debe agregar un producto al carrito del usuario)', async () => {

            // Enviamos el ID del producto y el quantity que vamos a agregar al carrito: 
            const result = await requester.post(`/api/carts/${currentUser.cart}/products/6510b2a776e6b8994a246741/quantity/1`).set('Cookie', [`${CoderCookiePremium.name}=${CoderCookiePremium.value}`])

            // Verificamos el estado de la response:
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);

            // Verificamos el resultado:
            expect(result.body.message).to.equal('Producto agregado al carrito exitosamente.');
            expect(result.body.result.result._id).to.equal(currentUser.cart);

            // Guardarmos el ID del producto, dentro del carrito: 
            const productsArray = result.body.result.result.products
            idProdInCart = productsArray[0]._id;

        }).timeout(10000);

        it('PUT - /api/carts/:cid/products/:pid (Se debe actualizar la cantidad de un producto en carrito)', async () => {

            const result = await requester.put(`/api/carts/${currentUser.cart}/products/${idProdInCart}`).set('Cookie', [`${CoderCookiePremium.name}=${CoderCookiePremium.value}`]).send({
                quantity: 3
            })

            // Verificamos el estado de la response:
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);

            // Verificamos el response: 
            expect(result.body.result.newQuantity).to.equal(3);
            
        }).timeout(10000);

        it('DELETE - /api/carts/:cid (Se deben borrar todos los productos del carrito)', async () =>{

            const result = await requester.delete(`/api/carts/${currentUser.cart}`).set('Cookie', [`${CoderCookiePremium.name}=${CoderCookiePremium.value}`])

            // Verificamos el estado de la response:
            expect(result.ok).to.be.ok;
            expect(result.body.statusCode).to.equal(200);

            // Verificamos el response: 
            expect(result.body.message).to.equal('Los productos del carrito se han eliminado exitosamente.');
        }).timeout(10000);

    });

})

//  mocha src/test/supertest.test.js