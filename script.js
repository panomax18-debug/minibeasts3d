let cart = [];
let currentProduct = null;
let currentSlideIndex = 0;
let currentSliderImages = [];

// === Привязка Firestore ===

import { filterProducts } from './admin.js'; // или абсолютный путь, если нужен

const firebaseConfig = {
  apiKey: "AIzaSyA2TAQM23nj7VOiHPv8HgDuXdWV_OVjX7A",
  authDomain: "minibeasts-3d.firebaseapp.com",
  projectId: "minibeasts-3d",
  storageBucket: "minibeasts-3d.firebasestorage.app",
  messagingSenderId: "192684036080",
  appId: "1:192684036080:web:c306f5de3f62ef87199735",
  measurementId: "G-MHG9HCXRCB"
};

window.Telegram = {
  WebApp: {
    sendData: (data) => console.log("📤 Емуляція sendData:", data),
    close: () => console.log("🛑 Емуляція закриття WebApp"),
    expand: () => console.log("🔍 Емуляція expand()")
  }
};

const tg = window.Telegram.WebApp;
console.log("📡 Telegram WebApp API:", tg);



// == 🔧 Навигация между модулями == //
export function showAddProductForm() {
  const container = document.getElementById("adminContent");
  container.innerHTML = generateAddProductForm();

  // ⏳ Ждём, пока DOM точно обновится
  const trySetup = () => {
    const form = document.getElementById("productForm");
    if (form) {
      setupProductFormHandler();
    } else {
      // 🔁 Пробуем снова через 50мс, максимум 10 раз
      if (trySetup.attempts < 10) {
        trySetup.attempts++;
        setTimeout(trySetup, 50);
      } else {
        console.warn("⚠️ Не вдалося знайти форму після вставки.");
      }
    }
  };
  trySetup.attempts = 0;
  trySetup();
}

export function showProductList() {
  document.getElementById("adminContent").innerHTML = "<p>📦 Список товарів...</p>";
}

export function showOrderList() {
  document.getElementById("adminContent").innerHTML = "<p>📨 Список замовлень...</p>";
}




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

  const confirmButton = document.getElementById("confirmButton");
  confirmButton.style.display = "inline-block";

  // ✅ Привязываем к добавлению в корзину
  confirmButton.onclick = confirmCustomization;
}



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



window.filterByType = function (tag) {
  const cards = document.querySelectorAll("#productGrid .product-card");

  cards.forEach(card => {
    const tags = card.querySelector(".tags")?.textContent || "";
    card.style.display = (tag === "all" || tags.includes(tag)) ? "block" : "none";
  });
};



// === ⬅️➡️ Переключение слайдов ===
window.nextSlide = function(button) {
  const slider = button.parentElement;
  const slides = slider.querySelectorAll('.slide');
  let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));

  slides.forEach(slide => slide.classList.remove('active'));
  const nextIndex = (currentIndex + 1) % slides.length;
  slides[nextIndex].classList.add('active');
};

window.prevSlide = function(button) {
  const slider = button.parentElement;
  const slides = slider.querySelectorAll('.slide');
  let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));

  slides.forEach(slide => slide.classList.remove('active'));
  const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  slides[prevIndex].classList.add('active');
};

// === 🖼️ Открытие модального окна ===
window.openModal = function(src) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  modalImg.src = src;
  modal.style.display = "flex";

  // Найти текущий слайдер и все его изображения
  const allSliders = document.querySelectorAll(".slider");
  for (const slider of allSliders) {
    const slides = slider.querySelectorAll(".slide");
    const index = Array.from(slides).findIndex(img => img.src === src);
    if (index !== -1) {
      currentSliderImages = Array.from(slides);
      currentSlideIndex = index;
      break;
    }
  }
};

window.showNextModalImage = function() {
  if (!currentSliderImages.length) return;
  currentSlideIndex = (currentSlideIndex + 1) % currentSliderImages.length;
  document.getElementById("modalImage").src = currentSliderImages[currentSlideIndex].src;
};

window.showPrevModalImage = function() {
  if (!currentSliderImages.length) return;
  currentSlideIndex = (currentSlideIndex - 1 + currentSliderImages.length) % currentSliderImages.length;
  document.getElementById("modalImage").src = currentSliderImages[currentSlideIndex].src;
};

// === ❌ Закрытие модального окна ===
window.closeImageModal = function() {
  document.getElementById("imageModal").style.display = "none";
};


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

  // 👇 Прокрутка к корзине
  document.getElementById("cart").scrollIntoView({ behavior: "smooth" });
}


function closeModal() {
  document.getElementById("customModal").style.display = "none";
}
// == 🔧 Переключення категорій ==
window.openCategory = function (category) {
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
};

document.addEventListener("DOMContentLoaded", () => {
  // 🔍 Навішування фільтра по тегам
  const input = document.getElementById("searchInput");

  const tryAttachFilter = () => {
    if (input && typeof window.filterProducts === "function") {
      input.addEventListener("input", window.filterProducts);
      console.log("✅ Фільтр навішено успішно.");
    } else {
      console.warn("⚠️ filterProducts ще не визначена. Повторна спроба через 200мс...");
      setTimeout(tryAttachFilter, 200);
    }
  };
  tryAttachFilter();

  // 🔄 Переключення категорій: ready / custom
  const customOrderSection = document.getElementById("custom-order");
  const btnReady = document.getElementById("btnReady");
  const btnCustom = document.getElementById("btnCustom");

if (btnReady) {
  btnReady.addEventListener("click", () => openCategory("ready"));
}

if (btnCustom) {
  btnCustom.addEventListener("click", () => openCategory("custom"));
}


  // 🧲 Завантаження товарів з Firestore
  const grid = document.getElementById("productGrid");
  if (!grid) {
    console.warn("⚠️ Контейнер #productGrid не знайдено.");
    return;
  }

firebase.firestore().collection("products").orderBy("timestamp", "desc").get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();

      const cardHTML = `
        <div class="product-card">
          <div class="slider">
            ${data.images.map((src, i) => `
              <img src="${src}" class="slide${i === 0 ? ' active' : ''}" onclick="openModal(this.src)">
            `).join("")}
            <button class="prev" onclick="prevSlide(this)">←</button>
            <button class="next" onclick="nextSlide(this)">→</button>
          </div>

          <h3>${data.name}</h3>
          <p>${data.description}</p>
          <p><strong>Особливість:</strong> ${data.feature}</p>
          <p><strong>Ціна:</strong> ${data.basePrice} грн</p>
          <button onclick="openCustomizationModal(this)">📊 Розрахувати вартість</button>
        </div>
      `;

      const isCustom = !!data.size80 || !!data.plastic1 || !!data.manualPrices;
      const containerId = isCustom ? "custom-order" : "ready-products";
      const container = document.getElementById(containerId);
      if (container) {
        container.insertAdjacentHTML("beforeend", cardHTML);
      }
    });
  })
  .catch(err => {
    console.error("❌ Помилка завантаження товарів:", err.message);
  });




// === Расчёт суммы заказа ===
function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// === Подтверждение заказа ===
function confirmOrder() {
  const tg = window.Telegram?.WebApp || {
      sendData: (data) => console.log("📤 Емуляція sendData:", data),
    close: () => console.log("🛑 Емуляція закриття WebApp")
  };

console.log("📋 Значення форми:", {
  fullName: document.getElementById("nameInput").value,
  phone: document.getElementById("phoneInput").value,
  city: document.getElementById("cityInput").value,
  branch: document.getElementById("branchInput").value
});


  // 🧾 Безопасная сборка Telegram-пользователя
  const rawUser = Telegram.WebApp.initDataUnsafe?.user || {};
  const telegramUser = {
    id: rawUser.id || null,
    username: rawUser.username || "",
    first_name: rawUser.first_name || "",
    last_name: rawUser.last_name || "",
    language_code: rawUser.language_code || ""
  };

const orderData = {
  contact: {
    name: document.getElementById("nameInput").value.trim(),
    phone: document.getElementById("phoneInput").value.trim()
  },
  delivery: {
    city: document.getElementById("cityInput").value.trim(),
    service: document.getElementById("deliveryService").value,
    branch: document.getElementById("branchInput").value.trim()
  },
  order: cart.map(item => ({
    name: item.name,
    size: item.size,
    plastic: item.plastic,
    quantity: item.quantity,
    price: item.price,
    comment: item.comment || ""
  })),
  telegramUser,
  paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || "card",
  total: calculateTotal(cart),
  timestamp: new Date().toISOString(),
  status: "pending"
};



  // ✅ Валидация обязательных полей
  if (
    !orderData.customer.fullName ||
    !orderData.customer.phone ||
    !orderData.delivery.city ||
    !orderData.delivery.branch
  ) {
    showToast("⚠️ Заповніть усі поля перед підтвердженням замовлення");
    return;
  }

  // 🧼 Удаление undefined/null-полей из telegramUser
  Object.keys(orderData.telegramUser).forEach(key => {
    if (orderData.telegramUser[key] === null || orderData.telegramUser[key] === undefined) {
      delete orderData.telegramUser[key];
    }
  });

  // 🧾 Логирование перед отправкой
  console.log("📤 Відправка замовлення:", orderData);

  // 🧾 Сохраняем заказ в Firestore
  submitOrder(orderData);

  // 📡 Отправка в Telegram WebApp
  tg.sendData(JSON.stringify(orderData));

  // 💳 Реквизиты оплаты
  if (orderData.payment === "card") {
    showToast("💳 Оплата на карту:\n4441 1144 1619 6630\nПризначення: MiniBeasts 3D");
  }

  if (orderData.payment === "ton") {
    showToast("🪙 TON-переказ:\nhttps://tonkeeper.app/transfer/...");
  }

  // ✅ Закрываем overlay сразу
  closeCheckout();

  // ✅ Финальное подтверждение и закрытие WebApp
  setTimeout(() => {
    showToast("✅ Замовлення надіслано!");
    cart = [];
    updateCart();
    tg.close();
  }, 1500);
}


// === Привязка обработчиков ===
document.getElementById("confirmBtn").addEventListener("click", confirmOrder);
document.getElementById("sizeSelect").addEventListener("change", calculatePrice);
document.getElementById("plasticSelect").addEventListener("change", calculatePrice);

// === Инициализация ===
document.getElementById("checkoutOverlay").style.display = "none";

// === Открытие формы оформления ===
function openCheckout() {
  if (cart.length === 0) {
    showToast("🚫 Корзина порожня. Додайте товари перед оформленням.");
    return;
  }

  document.getElementById("checkoutOverlay").style.display = "flex";
}



// === Отправка заказа ===
// === Подтверждение замовлення ===
async function submitOrder(orderData) {
  try {
    const cleanData = JSON.parse(JSON.stringify(orderData)); // 🧼 Удаляем undefined/null

    const docRef = await firebase.firestore().collection("orders").add(cleanData);
    console.log("📦 Замовлення записано з ID:", docRef.id);

    Telegram.WebApp.sendData(JSON.stringify({
      status: "success",
      orderId: docRef.id
    }));

    showToast("✅ Замовлення прийнято! Очікуйте підтвердження.");
  } catch (e) {
    console.error("❌ Помилка запису замовлення:", e);
    showToast("⚠️ Не вдалося записати замовлення. Спробуйте ще раз.");
  }
}

// === Закриття форми оформлення ===
function closeCheckout() {
  const overlay = document.getElementById("checkoutOverlay");
  if (overlay && overlay.style.display !== "none") {
    overlay.style.display = "none";
    console.log("✅ Форма оформлення закрита через closeCheckout()");
  }
}

// === Прив'язка функцій до window ===
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
window.filterProducts = filterProducts;

// === 🖨️ Друк на замовлення ===
async function submitCustomPrint(event) {
  event.preventDefault();

  const fileInput = document.getElementById("fileInput");
  const comment = document.getElementById("commentInput").value.trim();
  const contact = document.getElementById("contactInput").value.trim();

  if (!fileInput.files[0] || !comment || !contact) {
    showToast("⚠️ Додайте файл, коментар і контакт для зв'язку");
    return;
  }

  const file = fileInput.files[0];
  const telegramUser = Telegram.WebApp.initDataUnsafe?.user || {};

  const data = {
    fileName: file.name,
    fileType: file.name.split('.').pop().toLowerCase(),
    comment,
    contact,
    telegramUser: {
      id: telegramUser.id || null,
      username: telegramUser.username || ""
    },
    timestamp: new Date().toISOString(),
    status: "pending"
  };

  try {
    const cleanData = JSON.parse(JSON.stringify(data));
    const docRef = await firebase.firestore().collection("customPrints").add(cleanData);
    console.log("🖨️ Запит на друк записано з ID:", docRef.id);
    showToast("✅ Заявка прийнята! Ми зв'яжемось з вами.");

    document.getElementById("orderForm").reset(); // 🧼 Очистка форми
    document.getElementById("custom-order").classList.add("hidden"); // 🛑 Закриття блоку

    // ✅ Повернення до готових виробів
    document.getElementById("ready-products").classList.add("visible");
    document.getElementById("ready-products").classList.remove("hidden");

    setTimeout(() => {
      showToast("✅ Заявка надіслана!");
    }, 1000);

  } catch (e) {
    console.error("❌ Помилка запису запиту:", e);
    showToast("⚠️ Не вдалося надіслати запит. Спробуйте ще раз.");
  }
}

// === Прив'язка обробника форми ===
document.getElementById("orderForm").addEventListener("submit", submitCustomPrint);
