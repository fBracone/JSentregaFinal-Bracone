console.log("js ok");

const catalog = [
  { name: "item1", price: 5 },
  { name: "item2", price: 7 },
  { name: "item3", price: 2 },
];

const cart = [];

function validateEmpty(input) {
  return input === "";
}
function validateNumber(input) {
  return isNaN(Number(input));
}
function validateInteger(input) {
  return !Number.isInteger(Number(input));
}

function askInput(item) {
  const mensaje1 = ". Vale ";
  const mensaje2 = "$. Cuantos vas a llevar?";
  const alert = " Recorda ingresar un numero entero!!";
  let input = prompt("Tenemos " + item.name + mensaje1 + item.price + mensaje2);
  while (
    validateEmpty(input) ||
    validateNumber(input) ||
    validateInteger(input)
  ) {
    console.log("!!!");
    input = prompt(
      "Tenemos " + item.name + mensaje1 + item.price + mensaje2 + alert
    );
  }
  return Number(input);
}

alert("si llevas mas de 1000$ tenes un 10% de descuento");
const discount = 0.9;

for (let i = 0; i < catalog.length; i++) {
  const amount = askInput(catalog[i]);
  2;
  2;
  const totalPrice = amount * catalog[i].price;

  if (amount !== 0) {
    cart.push(Object.assign(catalog[i], { amount, totalPrice }));
  }
}

let finalMessage = "";

if (cart.length !== 0) {
  finalMessage = "Vas a llevar ";
  let finalPrice = 0;
  for (let i = 0; i < cart.length; i++) {
    finalPrice += cart[i].totalPrice;

    finalMessage +=
      cart[i].amount +
      " " +
      cart[i].name +
      " por " +
      cart[i].totalPrice +
      "$. ";
  }
  if (finalPrice > 1000) {
    const discountedPrice = discount * finalPrice;
    finalMessage +=
      "El monto total es de " +
      finalPrice +
      "$. Por llevar mas de 1000$ tenes un descuento del 10%. Vas a pagar " +
      discountedPrice +
      "$";
  } else {
    finalMessage += "El monto total es de " + finalPrice + "$";
  }
} else {
  finalMessage = "No vas a llevar nada :'(";
}

alert(finalMessage);
