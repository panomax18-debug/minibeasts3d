// admin.js — Часть 1

// 🧭 Перемикач вкладок адмінки з очищенням
function clearAdminContent() {
  const container = document.getElementById("adminContent");
  container.innerHTML = "";
}

document.getElementById("navAdd")?.addEventListener("click", () => {
  clearAdminContent();
  document.getElementById("adminContent").innerHTML = generateAddProductForm();
  setupProductFormHandler();
});

document.getElementById("navList")?.addEventListener("click", () => {
  clearAdminContent();
  showProductList(); // якщо реалізовано
});

document.getElementById("navOrders")?.addEventListener("click", () => {
  clearAdminContent();
  showOrderList();
});

// 🧾 Генерація форми додавання товару
function generateAddProductForm() {
  return `
    <h3>➕ Додати новий товар</h3>
    <form id="productForm">
      <div class="form-group">
        <label>Назва товару</label>
        <input type="text" id="productName" required>
      </div>

      <div class="form-group">
        <label>Базова ціна</label>
        <input type="number" id="basePrice" required>
      </div>

      <div class="form-group">
        <label>Коефіцієнти розміру (80, 100, 120)</label>
        <input type="number" id="size80" placeholder="80мм" required>
        <input type="number" id="size100" placeholder="100мм" required>
        <input type="number" id="size120" placeholder="120мм" required>
      </div>

      <div class="form-group">
        <label>Коефіцієнти пластику (1, 2, 3)</label>
        <input type="number" id="plastic1" placeholder="Однотонний" required>
        <input type="number" id="plastic2" placeholder="Двоколірний" required>
        <input type="number" id="plastic3" placeholder="Триколірний" required>
      </div>

      <div class="form-group">
        <label>Теги (через кому)</label>
        <input type="text" id="tagsInput" placeholder="labubu, cat, set">
      </div>

      <div class="form-group">
        <label>Особливість (унікальна властивість)</label>
        <input type="text" id="featureInput" placeholder="світиться в темряві, рухомі частини...">
      </div>

      <div class="form-group">
        <label>Ціни по розміру (мм)</label>
        <textarea id="sizePriceMapInput" rows="3" placeholder="80:150, 100:250, 120:400"></textarea>
      </div>

      <div class="form-group">
        <label>Зображення (URL через кому)</label>
        <textarea id="imagesInput" rows="3" placeholder="https://..."></textarea>
      </div>

      <button type="submit">📤 Додати товар</button>
    </form>
  `;
}

// 🧾 Обробка форми додавання товару
function setupProductFormHandler() {
  const form = document.getElementById("productForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("productName").value.trim();
    const base = parseFloat(document.getElementById("basePrice").value);
    const size80 = parseFloat(document.getElementById("size80").value);
    const size100 = parseFloat(document.getElementById("size100").value);
    const size120 = parseFloat(document.getElementById("size120").value);
    const plastic1 = parseFloat(document.getElementById("plastic1").value);
    const plastic2 = parseFloat(document.getElementById("plastic2").value);
    const plastic3 = parseFloat(document.getElementById("plastic3").value);
    const tags = document.getElementById("tagsInput").value.trim().split(",").map(t => t.trim());
    const images = document.getElementById("imagesInput").value.trim().split(",").map(url => url.trim());
    const feature = document.getElementById("featureInput").value.trim();
    const sizePriceRaw = document.getElementById("sizePriceMapInput").value.trim();

    // 🧩 Парсинг sizePriceMap
    const sizePriceMap = {};
    let sizePriceValid = true;

    sizePriceRaw.split(",").forEach(pair => {
      const [size, price] = pair.split(":").map(v => v.trim());
      if (!size || isNaN(price)) {
        sizePriceValid = false;
      } else {
        sizePriceMap[size] = parseFloat(price);
      }
    });

    // ✅ Валідація
    if (
      !name || isNaN(base) ||
      isNaN(size80) || isNaN(size100) || isNaN(size120) ||
      isNaN(plastic1) || isNaN(plastic2) || isNaN(plastic3) ||
      images.length === 0 || !sizePriceValid || Object.keys(sizePriceMap).length === 0
    ) {
      alert("⚠️ Заповніть усі поля коректно, включаючи ціни по розміру");
      return;
    }

    const productData = {
      name,
      base,
      size80,
      size100,
      size120,
      plastic1,
      plastic2,
      plastic3,
      tags,
      images,
      feature,
      sizePriceMap, // ✅ нове поле
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await firebase.firestore().collection("products").add(productData);
      alert(`✅ Товар додано з ID: ${docRef.id}`);
      form.reset();
    } catch (err) {
      console.error("❌ Помилка при додаванні товару:", err);
      alert("❌ Не вдалося додати товар. Спробуйте ще раз.");
    }
  });
}
// 📄 Відображення таблиці замовлень
function showOrderList() {
  const container = document.getElementById("adminContent");
  container.innerHTML = `
    <h3>📄 Замовлення</h3>
    <table id="ordersTable">
      <thead>
        <tr>
          <th>№</th>
          <th>Фото</th>
          <th>Товар</th>
          <th>Параметри</th>
          <th>Кількість</th>
          <th>Ціна</th>
          <th>Сума</th>
          <th>Отримувач</th>
          <th>Доставка</th>
          <th>Оплата</th>
          <th>Статус</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody id="ordersBody"></tbody>
    </table>
  `;

  // 📥 Завантаження замовлень з Firestore
  firebase.firestore().collection("orders").orderBy("timestamp", "desc").get().then(snapshot => {
  const tbody = document.getElementById("ordersBody");

  snapshot.forEach(doc => {
    const data = doc.data();
    const orderId = doc.id;
    const total = data.total || 0;
    const status = data.status || "Очікує оплату";

    data.items.forEach((item, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${index === 0 ? orderId : ""}</td>
        <td><img src="${item.photo || 'https://via.placeholder.com/40'}" width="40"></td>
        <td>${item.name}</td>
        <td>${item.size}мм, пластик ${item.material}</td>
        <td>${item.quantity}</td>
        <td>${item.price} грн</td>
        <td>${item.price * item.quantity} грн</td>
        <td>${data.fullName || "—"}<br>${data.phone || "—"}</td>
        <td>${data.delivery?.service || "—"}<br>${data.delivery?.city}, №${data.delivery?.branch}</td>
        <td>${data.payment || "—"}</td>
        <td>
          <select onchange="updateStatus('${orderId}', this.value)">
            ${[
              "Очікує оплату", "Оплачено", "Готується", "Друкується",
              "Відправлено", "Завершено", "Скасовано"
            ].map(s => `<option value="${s}" ${s === status ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </td>
        <td><button onclick="copyOrder('${orderId}')">📋</button></td>
      `;

      tbody.appendChild(row);
    });
  });
}

// 🔧 Оновлення статусу замовлення
function updateStatus(orderId, newStatus) {
  firebase.firestore().collection("orders").doc(orderId).update({ status: newStatus })
    .then(() => showToast("✅ Статус оновлено"))
    .catch(err => showToast("⚠️ Помилка оновлення статусу"));
}

// 📋 Копіювання ID замовлення
function copyOrder(orderId) {
  navigator.clipboard.writeText(orderId)
    .then(() => showToast(`📋 Скопійовано: ${orderId}`))
    .catch(() => showToast("⚠️ Не вдалося скопіювати"));
}
