// Captura tabla de productos en carrito:
const tableProdCartID = document.getElementById('tableProdCartID');
// Captura div cierre:
const cierreCompraDiv = document.getElementById('cierreCompra');

// Variable para almacenar los productos del carrito:
let products = [];

// Función para cargar el carrito y actualizar automáticamente:
function loadCartAndUpdate() {
  // Obtener los productos del carrito:
  fetch('/api/sessions/current')
    .then((response) => response.json())
    .then((data) => {
      const cartID = data.cart;

      fetch(`/api/carts/${cartID}`)
        .then((response) => response.json())
        .then((data) => {
          // Actualizar la variable products sin perder las cantidades:
          data.result.products.forEach((updatedProduct) => {
            const existingProduct = products.find(p => p._id === updatedProduct._id);
            if (existingProduct) {
              updatedProduct.quantity = existingProduct.quantity; // Mantener la cantidad.
            }
          });

          products = data.result.products;

          updateTable();
          updateTotalPrice(products);

          // Verificar si los productos están vacíos y tomar acción.
          if (products.length === 0) {
            handleEmptyCart();
          }
        });
    });
}

// Función para actualizar la tabla de productos en el carrito
function updateTable() {
  tableProdCartID.innerHTML = '';

  products.forEach((product) => {
    const {
      title,
      stock,
      thumbnails,
      price
    } = product.product;
    const quantity = product.quantity;
    const idProd = product._id;

    const subtotal = price * quantity;

    const productRow = `
      <tr>
        <td>${title}</td>
        <td><img src="${thumbnails[0]}" alt="${title}" class="Imgs"></td>
        <td>${stock}</td>
        <td>
          <input type="number" class="input-quantity" data-product-id="${idProd}" value="${quantity}" min="1" max="${stock}">
        </td>
        <td>$${price}</td>
        <td class="subtotal">$${subtotal}</td>
        <td>
          <img class="botonD papelera-icon" data-product-id="${idProd}" src="https://i.ibb.co/9rmL91b/papelera.png" alt="papelera">
        </td>
      </tr>`;

    tableProdCartID.insertAdjacentHTML('beforeend', productRow);
  });
}

// Función para manejar el carrito vacío:
function handleEmptyCart() {
  cierreCompraDiv.innerHTML = '<h2 style="margin: 6em;">El carrito está vacío.</h2>';
}

// Llamada a la función para cargar el carrito y actualizar automáticamente:
loadCartAndUpdate();

// Función para detectar cambios y actualizar automáticamente:
function pollForChanges() {
  // Intervalo de tiempo para consultar cambios:
  const pollingInterval = 10000;
  
  setInterval(() => {
    // Verificar si hay productos en el carrito antes de realizar el fetch:
    if (products.length > 0) {
      // Realizar el fetch y actualizar el carrito:
      loadCartAndUpdate();
    }
  }, pollingInterval);
}

// Iniciar el proceso de detección de cambios.
pollForChanges();

// Event listener para actualizar subtotal y precio total al modificar la cantidad a comprar:
tableProdCartID.addEventListener('input', (event) => {
  if (event.target.classList.contains('input-quantity')) {
    const productID = event.target.getAttribute('data-product-id');
    const quantity = parseInt(event.target.value, 10);

    // Buscar el producto en la lista de productos:
    const product = products.find(p => p._id === productID);
    if (product) {
      // Actualizar la cantidad y el subtotal del producto:
      product.quantity = quantity;
      const subtotalCell = event.target.parentElement.parentElement.querySelector('.subtotal');
      const unitPrice = parseFloat(product.product.price);
      const subtotal = unitPrice * quantity;
      subtotalCell.textContent = `$${subtotal.toFixed(2)}`;

      // Actualizar el precio total:
      updateTotalPrice(products);
    }
  }
});

// Delegación de eventos para el botón de eliminar
tableProdCartID.addEventListener('click', (event) => {
  if (event.target.classList.contains('botonD')) {
    const productID = event.target.getAttribute('data-product-id');
    deleteToCart(products, productID);
  }
});

// Función para calcular el precio total
function calculateTotalPrice(products) {
  let totalPrice = 0;

  products.forEach((product) => {
    const unitPrice = parseFloat(product.product.price);
    const quantity = product.quantity;
    const subtotal = unitPrice * quantity;
    totalPrice += subtotal;
  });

  return totalPrice;
}

// Función para actualizar el precio total y el botón de finalizar compra
function updateTotalPrice(products) {
  const totalPrice = calculateTotalPrice(products);
  const totalPriceSpan = document.getElementById('totalPrice');
  totalPriceSpan.textContent = ` $ ${totalPrice}`;

  // DOM boton finalizar compra: 
  const finalizarCompraBtn = document.getElementById('finalizarCompraBtn');
  finalizarCompraBtn.addEventListener('click', async () => {
    // Mostrar SweetAlert de confirmación
    const confirmationResult = await Swal.fire({
      title: 'Confirmar compra',
      text: '¿Estás seguro de que deseas finalizar la compra?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmationResult.isConfirmed) {
      // Continuar con la compra
      processPurchase(products);

      // Mostrar SweetAlert de procesamiento
      const processingAlert = await Swal.fire({
        title: 'Compra finalizada',
        text: 'En breve podrás acceder a la boleta de tu compra en la sección de tickets del carrito. ',
        icon: 'success',
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        allowOutsideClick: false
      });
      
    }
  });
}


// Función para eliminar un producto del carrito
function deleteToCart(products, productID) {
  // Obtener el ID del carrito
  fetch('/api/sessions/current')
    .then(response => response.json())
    .then(data => {
      const cartID = data.cart;

      // Realizar la eliminación del producto
      fetch(`/api/carts/${cartID}/products/${productID}`, {
          method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
          loadCartAndUpdate();
        })
        .catch(error => {
          console.error('Error al eliminar producto:', error);
        });
    })
    .catch(error => {
      console.error('Error al obtener el ID del carrito:', error);
    });
}

function processPurchase(products) {
  fetch('/api/sessions/current')
    .then(response => response.json())
    .then(data => {
      const cartID = data.cart;
      const userEmailAddress = data.email;

      // Crear un array de productos para enviar al servidor
      const productsToSend = products.map(product => {
        return {
          cartProductID: product._id, // _id del producto en carrito
          databaseProductID: product.product._id, // _id del producto en la base de datos
          quantity: product.quantity,
          title: product.product.title,
          price: product.product.price
        };
      });

      // Crear un objeto con los datos de la compra
      const purchaseData = {
        cartID: cartID,
        products: productsToSend, // Usar el array modificado
        userEmailAddress
      };

      // Mostrar los datos en la consola antes de enviarlos:
      console.log('Datos de compra a enviar:', purchaseData);

      // Enviar la información al servidor
      fetch(`/api/carts/${cartID}/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(purchaseData)
        })
        .then(response => response.json())
        .then(data => {
          // Manejar la respuesta del servidor aquí si es necesario
          console.log(data);
        })
        .catch(error => {
          console.error('Error al procesar la compra:', error);
        });
    })
    .catch(error => {
      console.error('Error al obtener el ID del carrito:', error);
    });
}