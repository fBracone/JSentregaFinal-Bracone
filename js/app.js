console.log("js ok");
import Toastify from "../node_modules/toastify-js/src/toastify-es.js";

let catalog = {};
let dolar = 1;
let cart = JSON.parse(localStorage.getItem("cart")) ?? [];

const cardContainer = document.getElementById("cardContainer");
const searchBar = document.getElementById("search");
const brandCheckboxes = document.querySelectorAll(".brand-checkbox");
const categoryCheckboxes = document.querySelectorAll(".category-checkbox");
const showCartButton = document.getElementById("open-cart");
const filtersBar = document.getElementById("filters-bar");
let showCartState = false;

const addCartToast = {
  text: "Producto agregado al carrito",
  gravity: "top",
  position: "right",
  close: true,
  style: {
    color: "rgb(46, 46, 46)",
    background: "linear-gradient( 53deg, #ccfffc, #ffcccf)",
  },
};

const buyToast = {
  text: "Compra realizada",
  gravity: "top",
  position: "center",
  close: true,
  style: {
    color: "rgb(46, 46, 46)",
    background: "linear-gradient( 53deg, #ccfffc, #ffcccf)",
  },
};

function getCatalog() {
  return new Promise((resolve, reject) => {
    fetch("../JSON/catalog.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar la API");
        }
        return response.json();
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

function getDolar() {
  return new Promise((resolve, reject) => {
    fetch("https://dolarapi.com/v1/dolares/oficial")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar dolarAPI");
        }
        return response.json();
      })
      .then((data) => resolve(data))
      .catch((error) => {
        console.error("Error al cargar dolarAPI", error);
        reject(error);
      });
  });
}

function filterCatalog(
  catalog,
  nameFilter,
  selectedBrands,
  selectedCategories
) {
  return catalog.filter(
    (product) =>
      product.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
      (selectedBrands.length === 0 || selectedBrands.includes(product.brand)) &&
      (selectedCategories.length === 0 ||
        selectedCategories.includes(product.categoria))
  );
}

function updateFilters() {
  const nameFilter = searchBar.value;
  const selectedBrands = Array.from(brandCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
  const selectedCategories = Array.from(categoryCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
  const filteredCatalog = filterCatalog(
    catalog,
    nameFilter,
    selectedBrands,
    selectedCategories
  );
  showProducts(cardContainer, filteredCatalog);
}

function findProduct(productId, arr) {
  return arr.findIndex((product) => product.id === productId);
}

async function addOrUpdateCart(productId, amount) {
  await fetchData();
  const index = findProduct(productId, cart);

  if (index !== -1) {
    const existingProduct = cart[index];
    existingProduct.amount = amount;
  } else {
    const addedProduct = { id: productId, amount };
    cart.push(addedProduct);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  updateTotalPrice();
}

function clearCart() {
  for (const product of cart) {
    removeElementCart(product.id);
  }
  cart = [];
  localStorage.removeItem("cart");
  updateCartCount();
}

function updateCatalog() {
  let newCatalog = [];
  for (const product of catalog) {
    let newProduct = { ...product };
    const cartIndex = findProduct(product.id, cart);
    if (cartIndex > -1) {
      newProduct.stock -= cart[cartIndex].amount;
    }
    newCatalog.push(newProduct);
  }
  return newCatalog;
}

function removeElementCart(productId) {
  const index = findProduct(productId, cart);
  if (index !== -1) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    removeCartProductListener(productId);
    document.getElementById(productId + "-hr").remove();
    document.getElementById(productId + "-cart").remove();
  }
  updateCartCount();
  updateTotalPrice();
  if (cart.length === 0) {
    updateFilters();
  }
}

function updateCartCount() {
  const cartArticlesSpan = document.getElementById("cart-articles");
  const cartButton = document.getElementById("open-cart");
  const totalAmount = cart.reduce(
    (totalAmount, { amount }) => totalAmount + amount,
    0
  );
  cartArticlesSpan.textContent = `(${totalAmount})`;
  if (totalAmount > 0) {
    cartButton.classList.add("cart-filled");
  } else {
    cartButton.classList.remove("cart-filled");
  }
}

function amountHandler(productId, amountInput) {
  const amount = parseInt(amountInput.value, 10);
  if (showCartState) {
    const index = findProduct(productId, catalog);
    const productPrice = catalog[index].price;
    const productTotalPriceSpan = document.getElementById(
      productId + "-total-price"
    );
    productTotalPriceSpan.innerHTML = `$${productPrice * amount}`;
  }
  Toastify(addCartToast).showToast();
  addOrUpdateCart(productId, amount);
}

async function buy() {
  await fetchData();
  const updatedCatalog = JSON.stringify(updateCatalog());
  clearCart();
  updateFilters();
  console.log(JSON.stringify(updatedCatalog));
  Toastify(buyToast).showToast();
}

function createProductListener(productId) {
  const addButton = document.getElementById(productId + "-add");
  const amountInput = document.getElementById(productId + "-amount");
  addButton.addEventListener("click", () =>
    amountHandler(productId, amountInput)
  );
}

function removeProductListener(productId) {
  const addButton = document.getElementById(productId + "-add");
  const amountInput = document.getElementById(productId + "-amount");
  addButton.removeEventListener("click", () =>
    amountHandler(productId, amountInput)
  );
}

function createCartProductListener(productId) {
  const removeButton = document.getElementById(productId + "-delete");
  const amountInput = document.getElementById(productId + "-update-amount");
  amountInput.addEventListener("change", () =>
    amountHandler(productId, amountInput)
  );
  removeButton.addEventListener("click", () => removeElementCart(productId));
}

function removeCartProductListener(productId) {
  const removeButton = document.getElementById(productId + "-delete");
  const amountInput = document.getElementById(productId + "-update-amount");
  amountInput.removeEventListener("change", () =>
    amountHandler(productId, amountInput)
  );
  removeButton.removeEventListener("click", () => removeElementCart(productId));
}

function CreateCardListener() {
  const closeCart = document.getElementById("close-cart");
  const buyCart = document.getElementById("cart-buy");
  buyCart.addEventListener("click", () => buy());
  closeCart.addEventListener("click", () => updateFilters());
}

function cleanContainer(container) {
  const existingProductButtons = container.querySelectorAll(".agregar-carrito");
  existingProductButtons.forEach((button) => {
    const productId = button.id.replace("-add", "");
    removeProductListener(productId);
  });
  container.innerHTML = ``;
}

function sumTotalPrice() {
  return cart.reduce(
    (total, { id, amount }) =>
      total +
      catalog.find(({ id: productId }) => id === productId).price *
        Number(amount),
    0
  );
}

async function updateTotalPrice() {
  await fetchData();
  const total = document.getElementById("total-price");
  if (total !== null) {
    const totalPrice = sumTotalPrice();
    total.innerHTML =
      cart.length > 0
        ? `TOTAL: $${totalPrice}<span>(${totalPrice * dolar} AR$)</span>`
        : "TOTAL:  ";
  }
}

function createCartCard(container) {
  let productsHTML = "";
  for (const product of cart) {
    const productDetails = catalog.find(({ id }) => id === product.id);
    productDetails.amount = product.amount;
    productsHTML += createCartProductHTML(productDetails);
  }
  const cartCard = document.createElement("div");
  cartCard.classList.add("card", "cart");
  cartCard.innerHTML = ` 
    <div class="cart-header"> 
      <h2>CARRITO DE COMPRAS</h2>
      <button class="cerrar-carrito" id="close-cart"> X </button>
    </div>
    <div>
      ${productsHTML}
    </div>
    <div class="total">
      <hr />
      <span class="price" id="total-price">TOTAL: $</span>
      </div>
    <div class="buy-div">
      <button class="comprar-carrito" id="cart-buy">Comprar</button>
    </div>  
  `;
  container.appendChild(cartCard);
  for (const product of cart) {
    createCartProductListener(product.id);
  }
  CreateCardListener();
  updateTotalPrice();
}

function createCartProductHTML({ id, name, brand, stock, price, amount }) {
  return `
          <hr id="${id}-hr" />
          <div class="product" id="${id}-cart">
            <div class="product-info">
              <button class="eliminar-carrito" id="${id}-delete"> X </button>
              <img src="./img/${id}.jpg" alt="" />
              <div class="product-name">
                <h3>${name}</h3>
                <h4>${brand}</h4>
              </div>
            </div>
            <div class="cant-price-cont">
              <div class="cantidad">
                <label>Cantidad:<input type="number" name="cantidad" value=${amount} min="1" 
                max="${stock}" class="update-amount" id="${id}-update-amount" /></label>
                <span class="stock">(${stock} disponibles)</span>
              </div>
              <span class="price" id="${id}-total-price">$
              ${price * amount}</span>
              <span class="pesos">(${price * amount * dolar} AR$)</span>
            </div>
          </div>
  `;
}

function createProductCard(
  { id, name, brand, description, stock, price },
  container
) {
  const stockHTML = `<div class="cant-price-cont">  
                        <div class="cantidad">
                          <label >Cantidad:<input type="number" name="cantidad" value="1" min="1" max="${stock}" id="${id}-amount" /></label>
                          <span class="stock">(${stock} disponibles)</span>
                        </div>
                        <div>
                        <span class="price">$${price}</span><span class="pesos">(
                          ${price * dolar} 
                        AR$)</span>
                        </div>
                      </div>
                      <button class="agregar-carrito" id="${id}-add" >Agregar al Carrito </button>   
                    `;
  const noStockHTML = `<span class="no-stock">SIN STOCK</span>`;
  const variableHTML = stock > 0 ? stockHTML : noStockHTML;
  const productCard = document.createElement("div");
  productCard.classList.add("card-wrap");
  productCard.innerHTML = `
                            <div class="card">
                              <img src="./img/${id}.jpg" alt="${name}" />
                              <h2>${name}</h2>
                              <h3>${brand}</h3>
                              <hr />
                              <div class="flexible">
                                <p>${description}</p>
                              </div>
                              <hr />
                              ${variableHTML}
                            </div>
  `;

  container.appendChild(productCard);
  if (stock > 0) {
    createProductListener(id);
  }
}

async function showProducts(container, catalog) {
  await fetchData();
  showCartState = false;
  filtersBar.classList.remove("hiden");
  cleanContainer(container);
  for (const product of catalog) {
    createProductCard(product, container);
  }
}

async function showCart(container) {
  await fetchData();
  cleanContainer(container);
  showCartState = true;
  filtersBar.classList.add("hiden");
  createCartCard(container);
}

function handleShowCartButton() {
  if (cart.length > 0) {
    showCart(cardContainer);
  }
}

async function fetchData() {
  try {
    catalog = await getCatalog();
  } catch (error) {
    console.error("Error en la app", error);
  }
  try {
    dolar = await getDolar();
    dolar = dolar.venta;
  } catch (error2) {
    console.error("Error en la app", error2);
  }
}

async function startApp() {
  await fetchData();
  brandCheckboxes.forEach((checkbox) =>
    checkbox.addEventListener("change", updateFilters)
  );
  categoryCheckboxes.forEach((checkbox) =>
    checkbox.addEventListener("change", updateFilters)
  );
  searchBar.addEventListener("input", updateFilters);
  showCartButton.addEventListener("click", () => handleShowCartButton());

  updateCartCount();
  showProducts(cardContainer, catalog);
}

startApp();

setInterval(async () => {
  await fetchData();
}, 600000);
