let cart = [];
let currentProduct = null;

// === Привязка Firestore ===

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2TAQM23nj7VOiHPv8HgDuXdWV_OVjX7A",
  authDomain: "minibeasts-3d.firebaseapp.com",
  projectId: "minibeasts-3d",
  storageBucket: "minibeasts-3d.firebasestorage.app",
  messagingSenderId: "192684036080",
  appId: "1:192684036080:web:c306f5de3f62ef87199735",
  measurementId: "G-MHG9HCXRCB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



if (!window.Telegram) {
  window.Telegram = {
    WebApp: {
      sendData: (data) => console.log("📤 Емуляція sendData:", data),
      close: () => console.log("🛑 Емуляція закриття WebApp"),
      expand: () => console.log("🔍 Емуляція expand()")
    }
  };
}

const tg = window.Telegram.WebApp;
tg.expand(); // теперь работает корректно

console.log("✅ script.js загружен");






function calculatePrice() {
  const plasticType = parseInt(document.getElementById("plasticSelect").value);
  const size = parseInt(document.getElementById("sizeSelect").value);
  let price = currentProduct.basePrice;

  if (plasticType === 2) price *= 1.05;
  if (plasticType === 3) price *= 1.15;

  if (size > 80) price *= 1.6667;
  if (size > 100) price *= 1.8;

  price = Math.round(price);
  document.getElementById("finalPrice").innerText = `Орієнтовна ціна: ${price} грн`;

  document.getElementById("confirmButton").style.display = "inline-block";
  const confirmButton = document.getElementById("confirmButton");

confirmButton.addEventListener("click", () => {
  const orderData = {
    userId: Telegram.WebApp.initDataUnsafe?.user?.id || "unknown",
    username: Telegram.WebApp.initDataUnsafe?.user?.username || "",
    first_name: Telegram.WebApp.initDataUnsafe?.user?.first_name || "",
    cart: cart,
    total: calculateTotal(cart),
    delivery: {
      city: cityInput.value,
      branch: branchInput.value,
      service: deliveryService.value
    },
    contact: {
      name: nameInput.value,
      phone: phoneInput.value
    },
    paymentMethod: selectedPaymentMethod,
    status: "pending",
    timestamp: new Date().toISOString()
  };

  submitOrder(orderData);
});

}

// -- кнопку выще возможно прийдется удалить??

function openCategory(category) {
  const ready = document.getElementById("ready-products");
  const custom = document.getElementById("custom-order");

  if (category === "ready") {
    ready.classList.add("visible");
    ready.classList.remove("hidden");
    custom.classList.add("hidden");
    custom.classList.remove("visible");
  } else {
    custom.classList.add("visible");
    custom.classList.remove("hidden");
    ready.classList.add("hidden");
    ready.classList.remove("visible");
  }
}





document.getElementById("orderForm").addEventListener("submit", function(e) {
  e.preventDefault();
  alert("Заявка на друк надіслана! Ми зв'яжемося з вами.");
});

function filterProducts() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll("#ready-products .product-card");

  cards.forEach(card => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    const tags = card.querySelector(".tags")?.textContent.toLowerCase() || "";
    const match = title.includes(input) || tags.includes(input);
    card.style.display = match ? "block" : "none";
  });
}
function filterByType(type) {
  const cards = document.querySelectorAll("#ready-products .product-card");

  cards.forEach(card => {
    if (type === "all") {
      card.style.display = "block";
    } else {
      card.style.display = card.classList.contains(type) ? "block" : "none";
    }
  });
}

window.filterByType = filterByType;


function nextSlide(button) {
  const slider = button.parentElement;
  const slides = slider.querySelectorAll('.slide');
  let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));

  slides.forEach(slide => slide.classList.remove('active'));
  const nextIndex = (currentIndex + 1) % slides.length;
  slides[nextIndex].classList.add('active');
}

function prevSlide(button) {
  const slider = button.parentElement;
  const slides = slider.querySelectorAll('.slide');
  let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));

  slides.forEach(slide => slide.classList.remove('active'));
  const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  slides[prevIndex].classList.add('active');
}


function openModal(src) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  modalImg.src = src;
  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("imageModal").style.display = "none";
}

function addToCart(name, price) {
  cart.push({ name, price });
  updateCart(); // обновляем корзину на экране
  alert(`${name} додано до кошика!`);
}



function updateCart() {
  const cartList = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  cartList.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "cart-item";

    // 🖼️ Превью изображения
    const img = document.createElement("img");
    img.src = item.image || "img/default.jpg";
    img.className = "cart-preview";
    img.alt = item.name;

   // 📦 Название товара
    const title = document.createElement("strong");
    title.innerText = item.name;


    // ⚙️ Характеристики
    const details = document.createElement("div");
    details.className = "cart-details";
    details.innerText = `📏 ${item.size}мм, 🎨 пластик ${item.plastic}-кольоровий${item.comment ? `, 💬 ${item.comment}` : ""}`;

    // 🔢 Количество
    const qty = document.createElement("input");
qty.type = "number";
qty.min = "1";
qty.value = item.quantity;
qty.className = "cart-qty-input";
qty.addEventListener("change", () => {
  const newQty = parseInt(qty.value);
  if (newQty < 1 || isNaN(newQty)) {
    showToast("❌ Мінімум 1 шт!");
    qty.value = item.quantity;
    return;
  }
  cart[index].quantity = newQty;
  updateCart(); // пересчитываем всё
});


    // 💰 Цена
    const price = document.createElement("span");
    price.className = "cart-price";
    price.innerText = `${item.price * item.quantity} грн`;

    // 🗑 Кнопка удаления
    const delBtn = document.createElement("button");
    delBtn.className = "cart-delete";
    delBtn.innerText = "🗑 Видалити";
    delBtn.onclick = () => deleteFromCart(index);

    // 📦 Контент справа от изображения
    const content = document.createElement("div");
    content.className = "cart-content";
    content.appendChild(title);
    content.appendChild(details);
    content.appendChild(qty);
    content.appendChild(price);
    content.appendChild(delBtn);

    // 📦 Собираем карточку
    li.appendChild(img);     // превью слева
    li.appendChild(content); // текст справа
    cartList.appendChild(li);

    total += item.price * item.quantity;
  });

  cartTotal.textContent = `Сума: ${total} грн`;
}


function deleteFromCart(index) {
  cart.splice(index, 1);
  updateCart();
  showToast("🗑 Товар видалено з корзини");
}


function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("visible");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
function clearCart() {
  cart = [];
  updateCart();
  showToast("🗑 Корзину очищено");
}

function openCustomizationModal(button) {
  const card = button.closest('.product-card');
  const name = card.querySelector('h3')?.innerText || "Без назви";
  const image = card.querySelector("img")?.src || "img/default.jpg";

  const config = card.querySelector('.config');
  const get = (cls) => parseFloat(config.querySelector(`.${cls}`)?.innerText || "1");

  const basePrice = get("base");

  currentProduct = {
    name,
    basePrice,
    image,
    sizeFactors: {
      80: get("size80"),
      100: get("size100"),
      120: get("size120")
    },
    plasticFactors: {
      1: get("plastic1"),
      2: get("plastic2"),
      3: get("plastic3")
    }
  };

  document.getElementById("modalTitle").innerText = name;
  document.getElementById("customComment").value = "";
  document.getElementById("sizeSelect").value = "100";
  document.getElementById("plasticSelect").value = "1";

  calculatePrice();
  document.getElementById("customModal").style.display = "flex";
}


function confirmCustomization() {
  calculatePrice(); // гарантируем актуальность
  const size = document.getElementById("sizeSelect").value;
  const plastic = document.getElementById("plasticSelect").value;
  const comment = document.getElementById("customComment").value;
  const finalPriceText = document.getElementById("finalPrice").innerText;
  const finalPrice = parseInt(finalPriceText.replace(/\D/g, '')) || currentProduct.basePrice;

  const quantity = 1; // по умолчанию 1
  const image = currentProduct.image || "img/default.jpg"; // превью товара

  cart.push({
    name: currentProduct.name,
    size,
    plastic,
    comment,
    quantity,
    price: finalPrice,
    image
  });

  updateCart(); // 🔄 Обновляем корзину на экране
  showToast("✅ Додано до корзини"); // 🔔 Показываем уведомление
  closeModal(); // ❌ Закрываем модальное окно
}



function closeImageModal() {
  document.getElementById("imageModal").style.display = "none";
}

function closeModal() {
  document.getElementById("customModal").style.display = "none";
}



document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnReady").addEventListener("click", () => {
    console.log("🔄 Переключення категорії: ready");
    openCategory("ready");
  });

  document.getElementById("btnCustom").addEventListener("click", () => {
    console.log("🔄 Переключення категорії: custom");
    openCategory("custom");
  });
});

// === Функция подтверждения заказа ===
function confirmOrder() {
  const tg = window.Telegram?.WebApp || {
    sendData: (data) => console.log("📤 Емуляція sendData:", data),
    close: () => console.log("🛑 Емуляція закриття WebApp")
  };

  const telegramUser = Telegram.WebApp.initDataUnsafe?.user;

  const orderData = {
    items: cart.map(item => ({
      name: item.name,
      size: item.size,
      material: item.plastic,
      quantity: item.quantity,
      price: item.price * item.quantity
    })),
    payment: document.querySelector('input[name="paymentMethod"]:checked')?.value || "card",
    delivery: {
      city: document.getElementById("cityInput").value.trim(),
      service: document.getElementById("deliveryService").value,
      branch: document.getElementById("branchInput").value.trim()
    },
    customer: {
      fullName: document.getElementById("nameInput").value.trim(),
      phone: document.getElementById("phoneInput").value.trim()
    },
    telegramUser: {
      id: telegramUser?.id,
      username: telegramUser?.username,
      first_name: telegramUser?.first_name,
      last_name: telegramUser?.last_name,
      language_code: telegramUser?.language_code
    },
    total: calculateTotal(cart),
    timestamp: new Date().toISOString()
  };

  tg.sendData(JSON.stringify(orderData));

  if (orderData.payment === "card") {
    showToast("💳 Оплата на карту:\n4441 1144 1619 6630\nПризначення: MiniBeasts 3D");
  }

  if (orderData.payment === "ton") {
    showToast("🪙 TON-переказ:\nhttps://tonkeeper.app/transfer/...");
  }

  setTimeout(() => {
    showToast("✅ Замовлення надіслано!");
    cart = [];
    updateCart();
    tg.close();
  }, 1500);
}

// === Привязка обработчика ===
document.getElementById("confirmBtn").addEventListener("click", confirmOrder);
document.getElementById("sizeSelect").addEventListener("change", calculatePrice);
document.getElementById("plasticSelect").addEventListener("change", calculatePrice);

document.getElementById("checkoutOverlay").style.display = "none";


function openCheckout() {
  if (cart.length === 0) {
    showToast("🚫 Корзина порожня. Додайте товари перед оформленням.");
    return;
  }

  document.getElementById("checkoutOverlay").style.display = "flex";
}

// === Отправка заказа ===
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

async function submitOrder(orderData) {
  try {
    const docRef = await addDoc(collection(db, "orders"), orderData);
    console.log("📦 Замовлення записано з ID:", docRef.id);

    Telegram.WebApp.sendData(JSON.stringify({
      status: "success",
      orderId: docRef.id
    }));

    alert("✅ Замовлення прийнято! Очікуйте підтвердження.");
  } catch (e) {
    console.error("❌ Помилка запису замовлення:", e);
    alert("⚠️ Не вдалося записати замовлення. Спробуйте ще раз.");
  }
}


window.filterByType = filterByType;
window.openCustomizationModal = openCustomizationModal;
window.clearCart = clearCart;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.closeModal = closeModal;
window.closeImageModal = closeImageModal;
window.addToCart = addToCart;
window.confirmCustomization = confirmCustomization;
window.deleteFromCart = deleteFromCart;
