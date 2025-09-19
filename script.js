// script.js — Часть 1

let cart = [];
let currentProduct = null;
let currentSlideIndex = 0;
let currentSliderImages = [];

// ✅ Telegram WebApp емуляція (для тестів у браузері)
window.Telegram = {
  WebApp: {
    sendData: (data) => console.log("📤 Емуляція sendData:", data),
    close: () => console.log("🛑 Емуляція закриття WebApp"),
    expand: () => console.log("🔍 Емуляція expand()")
  }
};

const tg = window.Telegram.WebApp;
console.log("📡 Telegram WebApp API:", tg);

// 🔧 Навігація між модулями адмінки
window.showAddProductForm = function () {
  const container = document.getElementById("adminContent");
  container.innerHTML = generateAddProductForm();

  // ⏳ Очікуємо DOM
  const trySetup = () => {
    const form = document.getElementById("productForm");
    if (form) {
      setupProductFormHandler();
    } else if (trySetup.attempts < 10) {
      trySetup.attempts++;
      setTimeout(trySetup, 50);
    } else {
      console.warn("⚠️ Не вдалося знайти форму після вставки.");
    }
  };
  trySetup.attempts = 0;
  trySetup();
};

// 📄 Відображення замовлень
window.showOrderList = function () {
  const container = document.getElementById("adminContent");
  container.innerHTML = "<h3>📄 Замовлення</h3><div id='orderList'></div>";

  const list = document.getElementById("orderList");
  list.innerHTML = "<p>⏳ Завантаження...</p>";

  firebase.firestore().collection("orders").orderBy("timestamp", "desc").get()
    .then(snapshot => {
      list.innerHTML = "";
      if (snapshot.empty) {
        list.innerHTML = "<p>😕 Замовлень поки немає</p>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const item = document.createElement("div");
        item.className = "admin-order";

        item.innerHTML = `
          <strong>${data.contact?.name || "Без імені"}</strong> — ${data.contact?.phone || "Без телефону"}<br>
          Доставка: ${data.delivery?.city}, №${data.delivery?.branch}<br>
          Оплата: ${data.paymentMethod}<br>
          Сума: ${data.order?.reduce((sum, item) => sum + item.price, 0)} грн<br>
          Статус: ${data.status}<br>
          <details>
            <summary>📦 Деталі</summary>
            ${data.order?.map(item => {
              const feature = item.feature ? ` — ${item.feature}` : "";
              return `${item.name} (${item.size}мм, пластик ${item.plastic})${feature} — ${item.price} грн`;
            }).join("<br>")}
          </details>
          <hr>
        `;

        list.appendChild(item);
      });
    })
    .catch(err => {
      console.error("❌ Помилка завантаження замовлень:", err);
      list.innerHTML = "<p>⚠️ Не вдалося завантажити замовлення</p>";
    });
}

// 📦 Відображення всіх товарів
window.showProductList = function () {
  const container = document.getElementById("adminContent");
  container.innerHTML = "<h3>📦 Всі товари</h3><div id='productList'></div>";

  const list = document.getElementById("productList");
  list.innerHTML = "<p>⏳ Завантаження...</p>";

  firebase.firestore().collection("products").get()
    .then(snapshot => {
      list.innerHTML = "";
      if (snapshot.empty) {
        list.innerHTML = "<p>😕 Немає товарів</p>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const item = document.createElement("div");
        item.className = "admin-product";

        item.innerHTML = `
          <strong>${data.name}</strong><br>
          Ціна: ${data.base} грн<br>
          Теги: ${data.tags?.join(", ")}<br>
          <img src="${data.images?.[0] || ''}" alt="${data.name}" width="100">
          <hr>
        `;

        list.appendChild(item);
      });
    })
    .catch(err => {
      console.error("❌ Помилка завантаження товарів:", err);
      list.innerHTML = "<p>⚠️ Не вдалося завантажити товари</p>";
    });
}

// 📊 Перемикач категорій (готові / кастом)
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

// 🔍 Фільтрація товарів по тегу
function filterByType(event) {
  const tag = event.target.dataset.tag;
  const cards = document.querySelectorAll(".product-card");

  cards.forEach(card => {
    const tags = card.querySelector(".tags")?.textContent || "";
    const match = tag === "all" || tags.includes(tag);
    card.style.display = match ? "block" : "none";
  });

  // 🔘 Візуальна активність кнопки
  document.querySelectorAll(".filter-button").forEach(btn => {
    btn.classList.remove("active-filter");
  });
  event.target.classList.add("active-filter");
}

// ⬅️ Перемикання слайдів назад
function prevSlide(button) {
  const slider = button.closest(".slider");
  const slides = slider.querySelectorAll("img");
  const activeIndex = Array.from(slides).findIndex(slide => slide.classList.contains("active"));

  slides[activeIndex].classList.remove("active");
  const newIndex = (activeIndex - 1 + slides.length) % slides.length;
  slides[newIndex].classList.add("active");
}

// ➡️ Перемикання слайдів вперед
function nextSlide(button) {
  const slider = button.closest(".slider");
  const slides = slider.querySelectorAll("img");
  const activeIndex = Array.from(slides).findIndex(slide => slide.classList.contains("active"));

  slides[activeIndex].classList.remove("active");
  const newIndex = (activeIndex + 1) % slides.length;
  slides[newIndex].classList.add("active");
}

// 🖼️ Відкриття модального перегляду зображення
function openModal(src) {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  modalImage.src = src;
  modal.style.display = "flex";

  // Збираємо всі зображення з поточного слайдера
  const slider = Array.from(document.querySelectorAll(".slide")).find(img => img.src === src)?.closest(".slider");
  currentSliderImages = slider ? Array.from(slider.querySelectorAll("img")) : [];
  currentSlideIndex = currentSliderImages.findIndex(img => img.src === src);
}

// ❌ Закриття модального вікна
function closeImageModal() {
  document.getElementById("imageModal").style.display = "none";
}

// ⬅️⬆️ Перемикання зображень в модальному вікні
function showPrevModalImage() {
  if (!currentSliderImages.length) return;
  currentSlideIndex = (currentSlideIndex - 1 + currentSliderImages.length) % currentSliderImages.length;
  document.getElementById("modalImage").src = currentSliderImages[currentSlideIndex].src;
}

function showNextModalImage() {
  if (!currentSliderImages.length) return;
  currentSlideIndex = (currentSlideIndex + 1) % currentSliderImages.length;
  document.getElementById("modalImage").src = currentSliderImages[currentSlideIndex].src;
}
// 📊 Відкриття модального вікна кастомізації
function openCustomizationModal(button) {
  const card = button.closest(".product-card");
  currentProduct = card;

  const title = card.querySelector("h3")?.textContent || "Товар";
  document.getElementById("modalTitle").textContent = title;

  // 🧩 Отримання sizePriceMap з Firestore
  const productId = card.dataset.id;
  firebase.firestore().collection("products").doc(productId).get().then(doc => {
    if (!doc.exists) {
      alert("❌ Товар не знайдено");
      return;
    }

    const data = doc.data();
    const sizePriceMap = data.sizePriceMap || {};
    const sizeSelect = document.getElementById("sizeSelect");
    const plasticSelect = document.getElementById("plasticSelect");
    const finalPriceField = document.getElementById("finalPrice");

    // 🧼 Очистка селекту
    sizeSelect.innerHTML = "";

    // 🧩 Генерація опцій розміру
    Object.entries(sizePriceMap).forEach(([size, price]) => {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = `${size} мм`;
      sizeSelect.appendChild(option);
    });

    // 📦 Відображення модалки
    document.getElementById("customModal").style.display = "flex";

    // 🧮 Розрахунок ціни
    function updatePrice() {
      const selectedSize = sizeSelect.value;
      const base = sizePriceMap[selectedSize];
      const plastic = parseInt(plasticSelect.value);
      const plasticMultiplier = plastic === 1 ? 1.0 : plastic === 2 ? 1.05 : 1.15;
      const final = Math.round(base * plasticMultiplier);
      finalPriceField.textContent = `Ціна: ${final} грн`;
      document.getElementById("confirmButton").style.display = "block";
    }

    // 🔄 Слухачі змін
    sizeSelect.addEventListener("change", updatePrice);
    plasticSelect.addEventListener("change", updatePrice);

    // 🔄 Початковий розрахунок
    updatePrice();
  });
}


// ❌ Закриття модального вікна
function closeModal() {
  document.getElementById("customModal").style.display = "none";
  currentProduct = null;
}

// 📐 Розрахунок ціни (використовується тільки всередині openCustomizationModal)

// ➕ Додавання товару до корзини
function confirmCustomization() {
  if (!currentProduct) return;

  const name = currentProduct.querySelector("h3")?.textContent || "Товар";
  const size = document.getElementById("sizeSelect").value;
  const plastic = document.getElementById("plasticSelect").value;
  const comment = document.getElementById("customComment").value.trim();
  const priceText = document.getElementById("finalPrice").textContent;
  const price = parseInt(priceText.replace(/\D/g, ""), 10);

  cart.push({ name, size, plastic, comment, price });
  updateCart();
  closeModal();
  showToast("➕ Товар додано до корзини");
}
// 🔁 Оновлення корзини
function updateCart() {
  const list = document.getElementById("cartItems");
  const total = document.getElementById("cartTotal");

  list.innerHTML = "";
  let sum = 0;

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} (${item.size}мм, пластик ${item.plastic}) — ${item.price} грн`;
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = () => deleteFromCart(index);
    li.appendChild(delBtn);
    list.appendChild(li);
    sum += item.price;
  });

  total.textContent = `Сума: ${sum} грн`;
}

// ❌ Видалення товару з корзини
function deleteFromCart(index) {
  cart.splice(index, 1);
  updateCart();
  showToast("🗑 Товар видалено з корзини");
}

// 🧹 Очистка корзини
function clearCart() {
  cart = [];
  updateCart();
  showToast("🧹 Корзина очищена");
}

// 🔔 Показ повідомлення
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("visible");

  setTimeout(() => {
    toast.classList.remove("visible");
  }, 3000);
}
// ✅ Підтвердження замовлення
function confirmOrder() {
  const name = document.getElementById("nameInput").value.trim();
  const phone = document.getElementById("phoneInput").value.trim();
  const city = document.getElementById("cityInput").value.trim();
  const branch = document.getElementById("branchInput").value.trim();
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

  const rawUser = Telegram?.WebApp?.initDataUnsafe?.user || {};
  const telegramUser = {
    id: rawUser.id || null,
    username: rawUser.username || ""
  };

  const orderData = {
    contact: { name, phone },
    delivery: { city, branch },
    paymentMethod,
    order: cart,
    telegramUser,
    timestamp: new Date().toISOString(),
    status: "pending"
  };

  // ✅ Валідація обов'язкових полів
  if (!name || !phone || !city || !branch) {
    showToast("⚠️ Заповніть усі поля перед підтвердженням замовлення");
    return;
  }

  // 🧼 Видалення пустих полів
  Object.keys(orderData.telegramUser).forEach(key => {
    if (orderData.telegramUser[key] === null || orderData.telegramUser[key] === undefined) {
      delete orderData.telegramUser[key];
    }
  });

  console.log("📤 Відправка замовлення:", orderData);

  // 🧾 Запис в Firestore
  submitOrder(orderData);

  // 📡 Відправка в Telegram WebApp
  tg.sendData(JSON.stringify(orderData));

  // 💳 Реквізити оплати
  if (paymentMethod === "card") {
    showToast("💳 Оплата на карту:\n4441 1144 1619 6630\nПризначення: MiniBeasts 3D");
  }

  if (paymentMethod === "ton") {
    showToast("🪙 TON-переказ:\nhttps://tonkeeper.app/transfer/...");
  }

  // ✅ Закриття overlay
  closeCheckout();

  // ✅ Завершення WebApp
  setTimeout(() => {
    showToast("✅ Замовлення надіслано!");
    cart = [];
    updateCart();
    tg.close();
  }, 1500);
}

// 🧾 Запис замовлення в Firestore
async function submitOrder(orderData) {
  try {
    const cleanData = JSON.parse(JSON.stringify(orderData)); // 🧼 Видалення null/undefined
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

// 🔗 Прив'язка обробників (тільки якщо елементи існують)
document.getElementById("confirmBtn")?.addEventListener("click", confirmOrder);
document.getElementById("sizeSelect")?.addEventListener("change", calculatePrice);
document.getElementById("plasticSelect")?.addEventListener("change", calculatePrice);

// 🧾 Ініціалізація (тільки якщо overlay існує)
const checkoutOverlay = document.getElementById("checkoutOverlay");
if (checkoutOverlay && checkoutOverlay.style) {
  checkoutOverlay.style.display = "none";
} else {
  console.warn("ℹ️ checkoutOverlay не знайдено при ініціалізації — можливо, це адмінка");
}


// 📦 Завантаження готових моделей з Firestore
async function loadProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) {
    console.warn("⚠️ productGrid не знайдено");
    return;
  }

  grid.innerHTML = "<p>⏳ Завантаження товарів...</p>";

  try {
    const snapshot = await firebase.firestore().collection("products").get();
    grid.innerHTML = "";

    if (snapshot.empty) {
      grid.innerHTML = "<p>😕 Немає доступних товарів</p>";
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <h3>${data.name}</h3>
        <p class="feature">${data.feature || ""}</p>
        <img src="${data.images?.[0] || ''}" alt="${data.name}" loading="lazy">
        <p class="base">${data.base} грн — базова модель (80мм, однотонний пластик)</p>
        <button onclick="openCustomizationModal(this)">⚙️ Кастомізувати</button>
      `;

      grid.appendChild(card); // ✅ теперь внутри forEach
    });
  } catch (err) {
    console.error("❌ Помилка завантаження товарів:", err);
    grid.innerHTML = "<p>⚠️ Не вдалося завантажити товари</p>";
  }
}

// 🚀 Виклик при завантаженні сторінки
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});
