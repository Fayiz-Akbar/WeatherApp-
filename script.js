const API_KEY = "fd38e08d6d1182060455b03de2aee0ae"; 
// Note: Gunakan API Key sendiri jika limit tercapai

// --- DOM Elements ---
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const refreshBtn = document.getElementById("refresh-btn");
const unitToggleBtn = document.getElementById("unit-toggle");
const themeToggleBtn = document.getElementById("theme-toggle");
const saveCityBtn = document.getElementById("save-city-btn");

const loader = document.getElementById("loader");
const errorMsg = document.getElementById("error");
const mainContent = document.getElementById("weather-content");

// --- State Management ---
let currentCity = "Jakarta";
let isMetric = true; // true = Celsius, false = Fahrenheit
let updateInterval;

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  loadPreferences();
  loadFavorites();
  getWeather(currentCity);
  startAutoUpdate();
});

// --- Event Listeners ---
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    currentCity = city;
    getWeather(city);
    cityInput.value = "";
  }
});

refreshBtn.addEventListener("click", () => {
  // Efek animasi putar
  const icon = refreshBtn.querySelector("i");
  if(icon) {
      icon.style.transition = "transform 0.5s";
      icon.style.transform = "rotate(360deg)";
      setTimeout(() => icon.style.transform = "rotate(0deg)", 500);
  }
  getWeather(currentCity);
});

unitToggleBtn.addEventListener("click", () => {
  isMetric = !isMetric;
  unitToggleBtn.textContent = isMetric ? "°C" : "°F";
  localStorage.setItem("unit", isMetric ? "metric" : "imperial");
  getWeather(currentCity);
});

themeToggleBtn.addEventListener("click", () => {
  document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark";
  const isDark = document.body.dataset.theme === "dark";
  themeToggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

saveCityBtn.addEventListener("click", () => {
  addFavorite(currentCity);
});

// --- Main Logic Functions ---

async function getWeather(city) {
  showLoading(true);
  errorMsg.classList.add("hidden");
  
  const unitParam = isMetric ? "metric" : "imperial";
  const lang = "id";

  try {
    // 1. Fetch Current Weather
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unitParam}&lang=${lang}`
    );
    
    if (!currentRes.ok) throw new Error("Kota tidak ditemukan.");
    const currentData = await currentRes.json();

    // 2. Fetch Forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${unitParam}&lang=${lang}`
    );
    const forecastData = await forecastRes.json();

    // 3. Render UI
    renderCurrentWeather(currentData);
    renderForecast(forecastData.list);
    
    // Update State
    currentCity = currentData.name;
    checkIfFavorite(currentCity);

  } catch (err) {
    showError(err.message || "Gagal mengambil data.");
    mainContent.classList.add("hidden");
  } finally {
    showLoading(false);
  }
}

function renderCurrentWeather(data) {
  mainContent.classList.remove("hidden");
  
  document.getElementById("city-name").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("timestamp").textContent = getFormattedDate();
  
  const iconCode = data.weather[0].icon;
  document.getElementById("main-icon").src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  
  document.getElementById("current-temp").textContent = Math.round(data.main.temp);
  
  // FIX: Menggunakan ID 'temp-unit' yang baru kita tambahkan di HTML
  const unitSpan = document.getElementById("temp-unit");
  if (unitSpan) {
      unitSpan.textContent = isMetric ? "°C" : "°F";
  }

  // Update tombol toggle di sidebar juga agar sinkron
  unitToggleBtn.textContent = isMetric ? "°C" : "°F";
  
  document.getElementById("weather-desc").textContent = data.weather[0].description;
  document.getElementById("wind-speed").textContent = `${data.wind.speed} m/s`;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
}

function renderForecast(list) {
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  const dailyData = list.filter(item => item.dt_txt.includes("12:00:00"));
  const fiveDays = dailyData.slice(0, 5);

  fiveDays.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("id-ID", { weekday: "short" });
    const icon = day.weather[0].icon;
    const temp = Math.round(day.main.temp);
    const unitSymbol = isMetric ? "°C" : "°F"; // Tidak pakai logic, hanya simbol

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <span class="forecast-day">${dayName}</span>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon">
      <span class="forecast-temp">${temp}${unitSymbol}</span>
      <span class="forecast-desc">${day.weather[0].description}</span>
    `;
    grid.appendChild(card);
  });
}

// --- Helper Functions ---

function startAutoUpdate() {
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(() => {
    console.log("Auto-updating...");
    getWeather(currentCity);
  }, 300000); 
}

function getFormattedDate() {
  const date = new Date();
  const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString("id-ID", options) + " WIB";
}

function showLoading(isLoading) {
  if (isLoading) {
    loader.classList.remove("hidden");
    mainContent.classList.add("hidden");
  } else {
    loader.classList.add("hidden");
  }
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
  loader.classList.add("hidden");
}

function loadPreferences() {
  const savedUnit = localStorage.getItem("unit");
  const savedTheme = localStorage.getItem("theme");

  if (savedUnit === "imperial") {
    isMetric = false;
  }

  if (savedTheme === "dark") {
    document.body.dataset.theme = "dark";
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
}

// --- Favorites System (Updated for List Layout) ---

function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem("weatherFavorites")) || [];
  const listContainer = document.getElementById("favorites-list");
  const emptyState = document.getElementById("empty-fav");
  
  if(!listContainer) return;

  listContainer.innerHTML = "";
  
  if (favorites.length > 0) {
    if(emptyState) emptyState.classList.add("hidden");
    
    favorites.forEach(city => {
      const item = document.createElement("div");
      item.className = "fav-item";
      // Tambahkan ikon lokasi kecil
      item.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${city}`;
      
      item.onclick = () => {
        currentCity = city;
        getWeather(city);
      };
      
      listContainer.appendChild(item);
    });
  } else {
    if(emptyState) emptyState.classList.remove("hidden");
  }
}

function addFavorite(city) {
  let favorites = JSON.parse(localStorage.getItem("weatherFavorites")) || [];
  
  // Cek agar tidak duplikat
  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem("weatherFavorites", JSON.stringify(favorites));
    loadFavorites();
    checkIfFavorite(city);
  }
}

function checkIfFavorite(city) {
  const favorites = JSON.parse(localStorage.getItem("weatherFavorites")) || [];
  const btnIcon = saveCityBtn.querySelector("i");
  
  if (favorites.includes(city)) {
    btnIcon.className = "fa-solid fa-bookmark"; 
    saveCityBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Tersimpan';
    saveCityBtn.disabled = true;
    saveCityBtn.style.opacity = "0.7";
  } else {
    btnIcon.className = "fa-regular fa-bookmark";
    saveCityBtn.innerHTML = '<i class="fa-regular fa-bookmark"></i> Simpan Kota';
    saveCityBtn.disabled = false;
    saveCityBtn.style.opacity = "1";
  }
}