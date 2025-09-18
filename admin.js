// == 📦 МОДУЛЬ АДМІНКИ MiniBeasts 3D == //
// Все функции доступны через window.functionName

// == 🔍 Фільтрація товарів == //
window.filterProducts = function () {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll("#ready-products .product-card");

  cards.forEach(card => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    const tags = card.querySelector(".tags")?.textContent.toLowerCase() || "";
    const match = title.includes(input) || tags.includes(input);
    card.style.display = match ? "block" : "none";
  });
};

// == 🔧 Навигация между модулями == //
window.showAddProductForm = function () {
  const container = document.getElementById("adminContent");
  container.innerHTML = generateAddProductForm();

  requestAnimationFrame(() => {
    const form = document.getElementById("productForm");
    if (form) {
      setupProductFormHandler();
    } else {
      console.warn("⚠️ Форма не знайдена після вставки.");
    }
  });
};

window.showProductList = async function () {
  const container = document.getElementById("adminContent");
  container.innerHTML = `<h2>📦 Всі товари</h2><div class="admin-product-list">Завантаження...</div>`;

  const products = await fetchProducts();
  const list = document.querySelector(".admin-product-list");

  if (!products.length) {
    list.innerHTML = `<p>⚠️ Товарів не знайдено.</p>`;
    return;
  }

  let html = "";

  products.forEach((product, index) => {
    html += `
      <div class="admin-product-card">
        <h3>${index + 1}. ${product.name}</h3>
        <p><strong>Опис:</strong> ${product.description}</p>
        <p><strong>Особливість:</strong> ${product.feature}</p>
        <p><strong>Ціна:</strong> ${product.basePrice} грн</p>
        <p><strong>Теги:</strong> ${product.tags?.join(" ") || "—"}</p>

        <details>
          <summary>⚙️ Конфігурація</summary>
          <ul>
            <li>📏 Розміри: 80мм = ${product.size80}, 100мм = ${product.size100}, 120мм = ${product.size120}</li>
            <li>🎨 Пластик: однотонний = ${product.plastic1}, двоколірний = ${product.plastic2}, триколірний = ${product.plastic3}</li>
          </ul>
        </details>

        ${product.images?.length ? `<p><strong>Зображення:</strong></p>` : ""}
        <div class="image-preview">
          ${product.images?.map(src => `<img src="${src}" width="80">`).join("")}
        </div>

        <div class="actions">
          <button onclick="editProduct('${product.id}')">✏️ Редагувати</button>
          <button onclick="deleteProduct('${product.id}')">🗑️ Видалити</button>
        </div>
      </div>
      <hr>
    `;
  });

  list.innerHTML = html;
};

// == 🔥 Отображення товарів та замовлень з Firebase == //
window.fetchProducts = async function () {
  try {
    const snapshot = await firebase.firestore().collection("products").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("❌ Помилка при завантаженні товарів:", error);
    return [];
  }
};

window.fetchOrders = async function () {
  try {
    const snapshot = await firebase.firestore().collection("orders").orderBy("timestamp", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("❌ Помилка при завантаженні замовлень:", error);
    return [];
  }
};

window.showOrderList = async function () {
  const container = document.getElementById("adminContent");

  container.innerHTML = `
    <h2>📨 Замовлення</h2>
    <input type="text" id="orderSearch" placeholder="🔍 Пошук замовлення..." oninput="filterOrders()">
    <table id="orderTable">
      <thead>
        <tr>
          <th>№</th>
          <th>Ім’я</th>
          <th>Телефон</th>
          <th>Товар</th>
          <th>Розмір</th>
          <th>Пластик</th>
          <th>Коментар</th>
          <th>Дата</th>
          <th>Статус</th>
          <th>Дія</th>
        </tr>
      </thead>
      <tbody id="orderBody"></tbody>
    </table>
  `;

  const orders = await fetchOrders();
  const tbody = document.getElementById("orderBody");

  orders.forEach((order, index) => {
    const item = order.order?.[0] || {};
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${order.contact?.name || "—"}</td>
      <td>${order.contact?.phone || "—"}</td>
      <td>${item.name || "—"}</td>
      <td>${item.size || "—"}</td>
      <td>${item.plastic || "—"}</td>
      <td>${item.comment || order.customPrints?.comment || "—"}</td>
      <td>${new Date(order.timestamp).toLocaleDateString()}</td>
      <td>${renderStatus(order.status)}</td>
      <td>
        <select onchange="updateOrderStatus('${order.id}', this.value)">
          <option value="pending">🟡 Очікує</option>
          <option value="paid">💳 Оплачено</option>
          <option value="accepted">📦 В роботі</option>
          <option value="shipped">🚚 Відправлено</option>
          <option value="done">✅ Виконано</option>
        </select>
        <button onclick="openChat('${order.telegramUser?.username}', '${order.contact?.phone}')">💬</button>
      </td>
    `;
    tbody.appendChild(row);
  });
};

window.renderStatus = function (code) {
  const map = {
    pending: "🟡 Очікує",
    paid: "💳 Оплачено",
    accepted: "📦 В роботі",
    shipped: "🚚 Відправлено",
    done: "✅ Виконано"
  };
  return map[code] || "—";
};


// == 🧱 Генерація форми додавання товару == //
window.generateAddProductForm = function () {
  return `
    <form id="productForm">
      <h2>➕ Додати новий товар</h2>

      <div class="form-group">
        <label>📛 Назва товару:</label>
        <input type="text" id="productName" required>
      </div>

      <div class="form-group">
        <label>📄 Опис:</label>
        <input type="text" id="productDescription">
      </div>

      <div class="form-group">
        <label>✨ Особливість:</label>
        <input type="text" id="productFeature">
      </div>

      <div class="form-group">
        <label>💰 Базова ціна (грн):</label>
        <input type="number" id="basePrice" required>
      </div>

      <div class="form-group">
        <label>📏 Розміри (коеф.):</label>
        <input type="number" id="size80" placeholder="80 мм">
        <input type="number" id="size100" placeholder="100 мм">
        <input type="number" id="size120" placeholder="120 мм">
      </div>

      <div class="form-group">
        <label>🎨 Типи пластику (коеф.):</label>
        <input type="number" id="plastic1" placeholder="Однотонний">
        <input type="number" id="plastic2" placeholder="Двоколірний">
        <input type="number" id="plastic3" placeholder="Триколірний">
      </div>

      <div class="form-group">
        <label>🏷️ Теги (через пробіл):</label>
        <input type="text" id="productTags" placeholder="labubu glow ручна робота">
      </div>

      <div class="form-group">
        <label>🖼️ Зображення товару:</label>
        <div id="imageInputs">
          <input type="text" class="image-url" placeholder="img/example.jpg">
        </div>
        <button type="button" onclick="addImageInput()">➕ Додати зображення</button>
      </div>

      <div class="form-group">
        <label>📊 Орієнтовні ціни реалізації:</label>
        <textarea id="manualPrices" rows="4" placeholder="80мм + однотонний = 150 грн"></textarea>
      </div>

      <div class="form-group">
        <button type="submit">💾 Зберегти товар</button>
      </div>
    </form>
  `;
};
// == 🖼️ Додавання нових полів для зображень == //
window.addImageInput = function () {
  const container = document.getElementById("imageInputs");
  const input = document.createElement("input");
  input.type = "text";
  input.className = "image-url";
  input.placeholder = "img/example.jpg";
  container.appendChild(input);
};

// == 📥 Обробка форми додавання товару == //
window.setupProductFormHandler = function () {
  const form = document.getElementById("productForm");
  if (!form) {
    console.warn("⚠️ Форма не знайдена — обробник не підключено.");
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
      name: form.querySelector("#productName").value.trim(),
      description: form.querySelector("#productDescription").value.trim(),
      feature: form.querySelector("#productFeature").value.trim(),
      basePrice: parseFloat(form.querySelector("#basePrice").value),
      size80: parseFloat(form.querySelector("#size80").value) || "",
      size100: parseFloat(form.querySelector("#size100").value) || "",
      size120: parseFloat(form.querySelector("#size120").value) || "",
      plastic1: parseFloat(form.querySelector("#plastic1").value) || "",
      plastic2: parseFloat(form.querySelector("#plastic2").value) || "",
      plastic3: parseFloat(form.querySelector("#plastic3").value) || "",
      tags: form.querySelector("#productTags").value.trim().split(" "),
      images: Array.from(form.querySelectorAll(".image-url"))
        .map(input => input.value.trim())
        .filter(src => src !== ""),
      manualPrices: form.querySelector("#manualPrices").value.trim(),
      timestamp: new Date().toISOString()
    };

    // ✅ Сохраняем в Firestore
    firebase.firestore().collection("products").add(data)
      .then(() => {
        // 🧱 Вставляем карточку на страницу
        const cardHTML = `
          <div class="product-card">
            <div class="config" style="display:none;">
              <span class="base">${data.basePrice}</span>
              <span class="size80">${data.size80}</span>
              <span class="size100">${data.size100}</span>
              <span class="size120">${data.size120}</span>
              <span class="plastic1">${data.plastic1}</span>
              <span class="plastic2">${data.plastic2}</span>
              <span class="plastic3">${data.plastic3}</span>
            </div>

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
            <div class="tags" style="display:none;">${data.tags.join(" ")}</div>
            <button onclick="openCustomizationModal(this)">📊 Розрахувати вартість</button>
          </div>
        `;

        const grid = document.getElementById("productGrid");
        if (grid) {
          grid.insertAdjacentHTML("beforeend", cardHTML);
        }

        alert("✅ Товар збережено в Firebase!");
        form.reset();
      })
      .catch(err => {
        alert("❌ Помилка при збереженні: " + err.message);
      });
  });
}; // ← вот эта скобка закрывает setupProductFormHandler
