let cart = [];

console.log("✅ script.js загружен");

const tg = window.Telegram.WebApp;
tg.expand(); // разворачивает WebApp на весь экран




function openCategory(category) {
  alert("Відкривається категорія: " + category);
}
function openCategory(category) {
  document.getElementById("ready-products").style.display = category === "ready" ? "block" : "none";
  document.getElementById("custom-order").style.display = category === "custom" ? "block" : "none";
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

function nextSlide(btn) {
  const slider = btn.parentElement;
  const slides = slider.querySelectorAll(".slide");
  let index = [...slides].findIndex(s => s.classList.contains("active"));
  slides[index].classList.remove("active");
  slides[(index + 1) % slides.length].classList.add("active");
}

function prevSlide(btn) {
  const slider = btn.parentElement;
  const slides = slider.querySelectorAll(".slide");
  let index = [...slides].findIndex(s => s.classList.contains("active"));
  slides[index].classList.remove("active");
  slides[(index - 1 + slides.length) % slides.length].classList.add("active");
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

  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} — ${item.price} грн`;
    cartList.appendChild(li);
    total += item.price;
  });

  cartTotal.textContent = `Сума: ${total} грн`;
}

    if (!window.Telegram) {
  window.Telegram = {
    WebApp: {
      sendData: (data) => console.log("📤 Емуляція sendData:", data),
      close: () => console.log("🛑 Емуляція закриття WebApp")
    }
  };
}


function submitOrder() {
  const tg = window.Telegram?.WebApp || {
    sendData: (data) => console.log("📤 Емуляція sendData:", data),
    close: () => console.log("🛑 Емуляція закриття WebApp")
  };

  const orderText = cart.map(item => `${item.name} — ${item.price} грн`).join('\n');
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const payload = `🛒 Замовлення:\n${orderText}\nСума: ${total} грн`;

  tg.sendData(payload);
  alert("✅ Замовлення надіслано!");
  cart = [];
  updateCart();
  tg.close();
}





