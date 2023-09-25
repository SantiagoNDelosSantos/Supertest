import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const collection = "ticket";

const productSchema = new mongoose.Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
    },
    quantity: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    }, 
    price: {
        type: Number,
        required: true,
    },
});

const ticketSchema = new mongoose.Schema({

    code: {
        type: String,
        default: uuidv4, 
    },

    purchase_datetime: {
        type: Date,
        default: Date.now,
    },

    // Productos que se pudieron comprar
    successfulProducts: [productSchema],

    // Productos que no se pudieron comprar
    failedProducts: [productSchema],     

    purchase: {
        type: String,
    },

    amount: {
        type: Number,
    },
});

export const ticketModel = mongoose.model(collection, ticketSchema);
