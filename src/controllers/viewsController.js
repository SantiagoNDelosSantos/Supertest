// Import ProductService: 
import ProductService from "../services/products.service.js";

// Import MessageService:
import MessageService from "../services/message.service.js";

// Import CartService:
import CartService from "../services/carts.service.js";

// Clase para el Controller de vistas: 
export default class ViewsController {

    constructor() {
        // Instancias de ViewsService:
        this.productService = new ProductService();
        this.messageService = new MessageService();
        this.cartService = new CartService();
    }

    // PRODUCTOS - VISTAS:

    // Traer todos los productos - Controller: 
    async getAllProductsControllerV(limit, page, sort, filtro, filtroVal) {
        let response = {};
        let limitV = limit;
        let pageV = page;
        let sortV = sort;
        let filtroV = filtro;
        let filtroValV = filtroVal;
        try {

            const limit = limitV || 10;
            const page = pageV || 1;
            let sort = sortV || 1;
            let filtro = filtroV || null;
            let filtroVal = filtroValV || null;

            const resultService = await this.productService.getAllProductsService(limit, page, sort, filtro, filtroVal);
            response.statusCode = resultService.statusCode;
            if (resultService.statusCode === 200) {
                response.result = resultService.result;
                response.hasNextPage = resultService.hasNextPage;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener los productos - Controller: " + error.message;
        };
        return response;
    };

    // CHAT - VISTA: 

    // Traer todos los mensajes en tiempo real:
    async getAllMessageControllerV() {
        let response = {};
        try {
            const resultService = await this.messageService.getAllMessageService();
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 200) {
                response.result = resultService.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener los mensajes - Controller: " + error.message;
        };
        return response;
    };

};