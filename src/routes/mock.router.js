// Import Router:
import { Router } from "express";

// Instancia de Router:
const mockRouter = Router();

// Import función de generateProducts:
import { generateProduct } from "../mocks/mock.config.js";

// Traer un 100 productos - Router:
mockRouter.get("/", async (req, res) => {
    let mockedProducts = [];
    for (let i = 0; i < 100; i++) {
        mockedProducts.push(generateProduct());
    };
    res.send({
        status: 'success',
        message: 'Productos generados',
        payload: mockedProducts
    })
});

export default mockRouter;