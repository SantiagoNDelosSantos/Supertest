// Una función por cada tipo de error que queramos tener...
export default class ErrorGenerator {

    // Carrito: 

    static generateCidErrorInfo(cid) {
        return `La propiedad de ID de carrito no tiene un formato válido, se recibió ${cid}.`;
    }

    static generateQuantityErrorInfo(quantity) {
        return `La cantidad proporcionada (${quantity}) no es un número válido o es cero.`;
    }

    static generatePurchaseErrorInfo(purchaseInfo) {
        return `Una o más propiedades en la información de compra están incompletas o no son válidas. Por favor, proporciona información de compra válida. Se recibió ${purchaseInfo}`;
    }

    static generateProductsPurchaseErrorInfo(databaseProductID, cartProductID) {
        return `Uno o más productos tienen un formato inválido. Como ID de producto se recibió ${databaseProductID} y como ID del  producto en el carrito se recibio ${cartProductID}.`;
    }

    static generateEmailUserErrorInfo(userEmail) {
        return `La dirección de correo electrónico proporcionada "${userEmail}" no es válida. Por favor, proporciona una dirección de correo electrónico válida.`;
    }

    static generateUpdatedCartForbiddenErrorInfo(){
        return `Esta ruta está diseñada exclusivamente para actualizar el contenido de un carrito al reemplazar los productos anteriores en él. No se aplica a los tickets, ya que, por cuestiones de seguridad, estos se agregan al carrito exclusivamente a través de la ruta de procesamiento de compra.`
    }

    static generateUpdatedCartFieldsErrorInfo(updateCartFields) {
        return `No se proporcionó ningún cuerpo products[{product}] para actualizar el carrito. Se recibió ${updateCartFields}`
    }

    static generateUpdatedCartFieldsErrorInfo2() {
        return `Uno o más productos no cumplen con la información requerida en el cuerpo de la solicitud. Verifica que todos los productos tengan su respectivo ID y quantity.`
    }

    static generateUpdatesProdInCartErrorInfo(quantity) {
        return `No se proporcionó valor de quantity, para actualizar el producto en carrito. Se recibió ${quantity}`
    }

    // Productos:

    static generateProductDataErrorInfo(productData) {
        return `Una o más propiedades en los datos del producto están faltando o no son válidas.
        Propiedades requeridas:
        * title: Debe ser un string, se recibió ${productData.title}.
        * description: Debe ser un string, se recibió (${productData.description}).
        * code: Debe ser un string, se recibió ${productData.code}.
        * price: Debe ser un número positivo mayor que 0, se recibió ${productData.price}.
        * stock: Debe ser un número positivo mayor que 0, se recibió ${productData.stock}.
        * category: Debe ser un string, se recibió ${productData.category}.
        * thumbnails: Debe ser un arreglo no vacío de URLs de imágenes, se recibió ${productData.thumbnails}.`;
    }

    static generatePidErrorInfo(pid) {
        return `La propiedad de ID del producto no tiene un formato válido, se recibió ${pid}.`;
    }

    static generateEmptyUpdateFieldsErrorInfo(updatedFields) {
        return `La información del producto es incompleta o incorrecta, se recibió: ${updatedFields}.`;
    }

    // Mensajes: 

    static generateMessageDataErrorInfo(messageData) {
        return `La información del mensaje es incompleta o incorrecta. Como usuario se recibió ${messageData.user} y como mensaje se recibio ${messageData.message}.`;
    }

    static generateMidErrorInfo(mid) {
        return `La propiedad de ID del mensaje no tiene un formato válido, se recibió ${mid}.`;
    }

    // Ticket:
    static generateTicketDataErrorInfo(ticketInfo) {
        let errorMessage = "Una o más propiedades en los datos del ticket están faltando o no son válidas.\nPropiedades requeridas:\n\n";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (Array.isArray(ticketInfo.successfulProducts) && ticketInfo.successfulProducts.length > 0) {
            errorMessage += "* successfulProducts: Debe ser un arreglo con productos válidos.\n";
            ticketInfo.successfulProducts.forEach((productInfo, index) => {
                errorMessage += `  Producto ${index + 1}:\n`;
                errorMessage += `    - _id: Debe ser un ObjectId válido, se recibió ${productInfo._id}\n`;
                errorMessage += `    - quantity: Debe ser un número positivo mayor que 0, se recibió ${productInfo.quantity}\n`;
                errorMessage += `    - title: Debe ser una cadena de texto, se recibió ${productInfo.title}\n`;
                errorMessage += `    - price: Debe ser un número positivo mayor que 0, se recibió ${productInfo.price}\n`;
            });
        }
        if (Array.isArray(ticketInfo.failedProducts) && ticketInfo.failedProducts.length > 0) {
            errorMessage += "* failedProducts: Debe ser un arreglo con productos válidos.\n";
            ticketInfo.failedProducts.forEach((productInfo, index) => {
                errorMessage += `  Producto ${index + 1}:\n`;
                errorMessage += `    - _id: Debe ser un ObjectId válido, se recibió ${productInfo._id}\n`;
                errorMessage += `    - quantity: Debe ser un número positivo mayor que 0, se recibió ${productInfo.quantity}\n`;
                errorMessage += `    - title: Debe ser una cadena de texto, se recibió ${productInfo.title}\n`;
                errorMessage += `    - price: Debe ser un número positivo mayor que 0, se recibió ${productInfo.price}\n`;
            });
        }
        if (!ticketInfo.purchase) {
            errorMessage += "* purchase: Debe ser un correo electrónico.\n";
        } else if (!emailRegex.test(ticketInfo.purchase)) {
            errorMessage += "* purchase: El correo electrónico proporcionado no es válido.\n";
        }
        if (!ticketInfo.amount) {
            errorMessage += "* amount: Debe ser un número positivo mayor que 0.\n";
        } else if (typeof ticketInfo.amount !== 'number' || ticketInfo.amount <= 0) {
            errorMessage += "* amount: Debe ser un número positivo mayor que 0.\n";
        }
        return errorMessage;
    }

    static generateTidErrorInfo(tid) {
        return `La propiedad de ID del ticket no tiene un formato válido, se recibió ${tid}.`;
    }

    // Usuarios:

    static generateRegisterDataErrorInfo(userRegister) {
        return `Una o más propiedades en los datos de registro están faltando o no son válidas.
        Propiedades requeridas:
        * first_name: Debe ser un string sin números, se recibió ${userRegister.first_name}.
        * last_name: Debe ser un string sin números, se recibió ${userRegister.last_name}.
        * email: Debe ser un correo electrónico válido, se recibió ${userRegister.email}.
        * age: Debe ser un número, se recibió ${userRegister.age}.
        * password: Se requiere una contraseña válida, puede ser un string, un número o una combinación de ambos.`
    }

    static generateLoginDataErrorInfo(userLogin) {
        return `Una o más propiedades en los datos del login están faltando o no son válidas.
        Propiedades requeridas:
        * email: Debe ser un correo electrónico válido, se recibió ${userLogin.email}.
        * password: Se requiere una contraseña válida, puede ser un string, un número o una combinación de ambos.`
    }

    static generateResetPass1Info(userEmail) {
        return `El correo electrónico no es válido, se recibió ${userEmail}.`
    }

    static generateResetPass2Info() {
        return `Uno de los campos de contraseñas está incompleto o la contraseña de confirmación no coincide con la nueva contraseña. Asegúrese de que ambos campos estén completos y que las contraseñas coincidan antes de continuar. Por favor, revise el formulario y vuelva a intentarlo.`
    }

    static generateUserIdInfo(uid) {
        return `El ID de usuario no tiene un formato válido, se recibió ${uid}.`;
    }

}