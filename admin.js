// admin.js — Часть 1

// 🧭 Перемикач вкладок адмінки
document.getElementById("navAdd")?.addEventListener("click", showAddProductForm);
document.getElementById("navList")?.addEventListener("click", showProductList);
document.getElementById("navOrders")?.addEventListener("click", showOrderList);

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
    const feature = document.getElementById("featureInput").value.trim(); // ← вот эта строка


    // ✅ Валідація
    if (!name || !base || !size80 || !size100 || !size120 || !plastic1 || !plastic2 || !plastic3 || images.length === 0) {
      alert("⚠️ Заповніть усі поля коректно");
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
