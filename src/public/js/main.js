// Iniciar Socket:
const socket = io();

// Hacemos una solicitud a la ruta '/api/sessions/current para obtener los datos del usuario
fetch('/api/sessions/current')

  .then((response) => response.json())
  .then((data) => {

    // Aquí recibimos los datos del usuario en la variable 'data'
    let user = data;

    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: `Hola ${user.name}, has iniciado sesión con éxito.`,
    });
  })
  .catch((error) => {
    console.error('Error al obtener los datos del usuario:', error);
  });


// Capturamos la tabla de productos del DOM:
const tableProd = document.getElementById('tableProd');

function allProducts() {

  // Primera carga de todos los productos:

  console.log("Primera carga - General")

  socket.on("products", (products) => {

    let productos = products;

    let htmlProductos = "";

    htmlProductos += `
    <thead>
      <tr>
          <th>Modelo</th>
          <th>Descripción</th>
          <th>Img Front</th>  
          <th>Img Back</th> 
          <th>Stock</th>
          <th>Precio</th>
          <th>Unds. a comprar</th>
          <th>+ Cart</th>
      </tr>
    </thead>`;

    productos.docs.forEach((product) => {
      htmlProductos += `
          <tr>
            <td id="${product.title}">${product.title}</td>
            <td class="description">${product.description}</td>
            <td><img src="${product.thumbnails[0]}" alt="${product.title}" class="Imgs"></td>
            <td><img src="${product.thumbnails[1]}" alt="${product.title}" class="Imgs"></td>
            <td>${product.stock} Und.</td>
            <td>$${product.price}</td>
            <td><input type="number" id="cantidadInput${product._id}" min="1" max="${product.stock}" value="1"></td>
            <td>
              <img id="agr${product._id}" src="https://i.ibb.co/rbtzRGS/A-adir-cart.png" alt="Agregar al carrito" class="cart-icon">
            </td>
          </tr>`;
    });

    tableProd.innerHTML = htmlProductos;

    // Obtengo el id de cada boton +Cart:

    products.docs.forEach((product) => {
      const botonAgregar = document.getElementById(`agr${product._id}`);
      const titleElement = document.getElementById(`${product.title}`);
      const title = titleElement.textContent;

      botonAgregar.addEventListener('click', () => {
        const cantidadInput = document.getElementById(`cantidadInput${product._id}`);
        const quantity = cantidadInput.value;
        addToCart(product._id, title, quantity);
      });

    });

    function addToCart(productID, title, quantity) {

      // Hacemos una solicitud a la ruta '/api/sessions/current para obtener los datos del usuario
      fetch('/api/sessions/current')

        .then((response) => response.json())
        .then((data) => {
          // Aquí recibimos los datos del usuario en la variable 'data'
          let user = data;

          const cartID = user.cart;
          const productIDValue = productID;

          if (cartID && productIDValue) {
            fetch(`/api/carts/${cartID}/products/${productIDValue}/quantity/${quantity}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            })

            if (quantity && title) {
              Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 5000,
                title: `${quantity} Unds. de ${title} se ha agregado a tu carrito`,
                icon: 'success'
              });
            }
          }
        })

    }

  });

}

allProducts()


// Busqueda filtrada: 

// Capturamos tabla de filtros e inputs:
const tableFil = document.getElementById('tableFil');
const limit = document.getElementById('limit');
const page = document.getElementById("page");
const sort = document.getElementById("sort");
const filtro = document.getElementById("filtro");
const filtroVal = document.getElementById("filtroVal");
const limpiarFiltros = document.getElementById("limpiarFiltros");

// Creamos la function filtrarProdcuts:
function filtrarProducts() {
  const busquedaProducts = {
    limit: limit.value || 10,
    page: page.value || 1,
    sort: sort.value || 1,
    filtro: filtro.value || null,
    filtroVal: filtroVal.value || null,
  }
  socket.emit('busquedaFiltrada', busquedaProducts);
  return busquedaProducts;
}

limit.addEventListener('input', () => {
  filtrarProducts();
});

page.addEventListener('input', () => {
  filtrarProducts();
});

sort.addEventListener('change', () => {
  filtrarProducts();
});

filtroVal.addEventListener('change', () => {
  filtrarProducts();
});

// Captura div de Pags:

const Pags = document.getElementById('Pags');

// Paginación:

socket.on('products', (products) => {

  const currentPage = products.page;
  const hasNextPage = products.hasNextPage;

  let htmlPag = "";

  htmlPag +=

    `<h2 class="pag" id="Prev">Prev </h2>

    <h2 class="pag pagNumber" id="numberPag">${currentPage}</h2>

    <h2 class="pag" id="Next">Next</h2>`;

  Pags.innerHTML = htmlPag;

  const prevButton = document.getElementById('Prev');
  const nextButton = document.getElementById('Next');

  function cambiarPagina(currentPage, newPage, hasNextPage) {

    if (newPage === -1) {
      if (currentPage < 1) {
        currentPage = 1;
      } else {
        currentPage = currentPage - 1;
      }
    }

    if (newPage === 1) {
      if (hasNextPage === false) {
        currentPage;
      } else {
        currentPage = currentPage + 1;
      }
    }

    if (currentPage) {

      const busquedaProducts = {
        limit: limit.value || 10,
        page: Number(currentPage),
        sort: sort.value || 1,
        filtro: filtro.value || null,
        filtroVal: filtroVal.value || null,
      }

      socket.emit('busquedaFiltrada', busquedaProducts);

      const pageInput = document.getElementById('page');
      pageInput.value = currentPage.toString();
    }
  }

  prevButton.addEventListener('click', (e) => {
    e.preventDefault();
    cambiarPagina(currentPage, -1, hasNextPage);
  });

  nextButton.addEventListener('click', (e) => {
    e.preventDefault();
    cambiarPagina(currentPage, +1, hasNextPage);
  });

});