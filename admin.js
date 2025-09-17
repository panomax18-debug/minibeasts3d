// == 📦 МОДУЛЬ АДМІНКИ MiniBeasts 3D == //
// Все функции экспортируются для использования в admin.html

// == 🔧 Навигация между модулями == //

export function showAddProductForm() {
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
}

export function showProductList() {
  const container = document.getElementById("adminContent");
  container.innerHTML = `
    <h2>📦 Список товарів</h2>
    <p>Тут буде таблиця з усіма товарами...</p>
  `;
}

export function showOrderList() {
  const container = document.getElementById("adminContent");
  container.innerHTML = `
    <h2>📨 Замовлення</h2>
    <p>Тут буде список заявок...</p>
  `;
}

// == 🧱 Генерация форми додавання товару == //
export function generateAddProductForm() {
  return `
    <form id="productForm">
      <h2>➕ Додати новий товар</h2>

      <label>📛 Назва товару:</label>
      <input type="text" id="productName" required>

      <label>📄 Опис:</label>
      <input type="text" id="productDescription">

      <label>✨ Особливість:</label>
      <input type="text" id="productFeature">

      <label>💰 Базова ціна (грн):</label>
      <input type="number" id="basePrice" required>

      <label>📏 Розміри (коеф.):</label>
      <input type="number" id="size80" placeholder="80 мм">
      <input type="number" id="size100" placeholder="100 мм">
      <input type="number" id="size120" placeholder="120 мм">

      <label>🎨 Типи пластику (коеф.):</label>
      <input type="number" id="plastic1" placeholder="Однотонний">
      <input type="number" id="plastic2" placeholder="Двоколірний">
      <input type="number" id="plastic3" placeholder="Триколірний">

      <label>🏷️ Теги (через пробіл):</label>
      <input type="text" id="productTags" placeholder="labubu glow ручна робота">

      <label>🖼️ Зображення товару:</label>
      <div id="imageInputs">
        <input type="text" class="image-url" placeholder="img/example.jpg">
      </div>
      <button type="button" onclick="addImageInput()">➕ Додати зображення</button>

      <label>📊 Орієнтовні ціни реалізації:</label>
      <textarea id="manualPrices" rows="4" placeholder="80мм + однотонний = 150 грн"></textarea>

      <button type="submit">💾 Зберегти товар</button>
    </form>
  `;
}

// == 🖼️ Добавление новых полей для изображений == //
export function addImageInput() {
  const container = document.getElementById("imageInputs");
  const input = document.createElement("input");
  input.type = "text";
  input.className = "image-url";
  input.placeholder = "img/example.jpg";
  container.appendChild(input);
}

// == 📥 Обработка формы добавления товара == //
export function setupProductFormHandler() {
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
      manualPrices: form.querySelector("#manualPrices").value.trim()
    };

    const cardHTML = `<div class="product-card">
      <h3>${data.name}</h3>
      <p>${data.description}</p>
      <p><strong>Ціна:</strong> ${data.basePrice} грн</p>
      <p><strong>Теги:</strong> ${data.tags.join(", ")}</p>
    </div>`;

    const grid = document.getElementById("productGrid");
    if (grid) {
      grid.insertAdjacentHTML("beforeend", cardHTML);
    }

    alert("✅ Товар додано!");
    form.reset();
  });
}

export function filterProducts() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll("#ready-products .product-card");

  cards.forEach(card => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    const tags = card.querySelector(".tags")?.textContent.toLowerCase() || "";
    const match = title.includes(input) || tags.includes(input);
    card.style.display = match ? "block" : "none";
  });
}

window.filterProducts = filterProducts;

