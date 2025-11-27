const API_KEY = "fd38e08d6d1182060455b03de2aee0ae"; 

// --- DOM Elements ---
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const suggestionsList = document.getElementById("suggestions-list"); // Element Baru

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
let debounceTimer; // Timer untuk delay search

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  loadPreferences();
  loadFavorites();
  getWeather(currentCity);
  startAutoUpdate();
});

// --- Event Listeners ---

// 1. Search Submit (Enter)
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    commitSearch(city);
  }
});

// 2. Auto-complete Logic (Input Typing)
cityInput.addEventListener("input", function() {
  const query = this.value.trim();
  
  // Reset timer setiap kali user mengetik
  clearTimeout(debounceTimer);
  
  // Jika input kosong atau kurang dari 3 huruf, sembunyikan saran
  if (query.length < 3) {
    suggestionsList.classList.add("hidden");
    return;
  }

  // Tunggu 400ms setelah user berhenti mengetik, baru request ke API
  debounceTimer = setTimeout(() => {
    fetchCitySuggestions(query);
  }, 400);
});

// 3. Menutup dropdown jika klik di luar
document.addEventListener("click", (e) => {
  if (!suggestionsList.contains(e.target) && e.target !== cityInput) {
    suggestionsList.classList.add("hidden");
  }
});

// 4. Tombol-tombol Kontrol
refreshBtn.addEventListener("click", () => {
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

// --- Logic Functions ---

function commitSearch(city) {
  currentCity = city;
  getWeather(city);
  suggestionsList.classList.add("hidden"); // Sembunyikan saran
  cityInput.value = ""; // Bersihkan input
}

// Fitur Baru: Fetch Saran Kota dari Open-Meteo (Gratis & Cepat)
async function fetchCitySuggestions(query) {
  // API ini gratis dan tidak butuh key
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=id&format=json`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      renderSuggestions(data.results);
    } else {
      suggestionsList.classList.add("hidden");
    }
  } catch (err) {
    console.error("Gagal mengambil saran kota", err);
  }
}

function renderSuggestions(cities) {
  suggestionsList.innerHTML = "";
  suggestionsList.classList.remove("hidden");

  cities.forEach(city => {
    const li = document.createElement("li");
    li.className = "suggestion-item";
    
    // Tampilkan Nama, Provinsi (jika ada), dan Negara
    const region = city.admin1 ? city.admin1 : "";
    const country = city.country_code ? city.country_code : "";
    
    li.innerHTML = `
      ${city.name}
      <span>${region} ${country ? ', ' + country : ''}</span>
    `;

    // Saat diklik, langsung load cuaca
    li.addEventListener("click", () => {
      cityInput.value = city.name;
      commitSearch(city.name);
    });

    suggestionsList.appendChild(li);
  });
}

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
    currentCity = currentData.name; // Pakai nama resmi dari API (misal: "jaka" -> "Jakarta")
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
  
  // Update simbol unit
  const unitSpan = document.getElementById("temp-unit");
  if (unitSpan) unitSpan.textContent = isMetric ? "°C" : "°F";
  unitToggleBtn.textContent = isMetric ? "°C" : "°F";
  
  document.getElementById("weather-desc").textContent = data.weather[0].description;
  document.getElementById("wind-speed").textContent = `${data.wind.speed} m/s`;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
}

function renderForecast(list) {
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  // Filter: Ambil data jam 12:00 siang
  const dailyData = list.filter(item => item.dt_txt.includes("12:00:00"));
  const fiveDays = dailyData.slice(0, 5);

  fiveDays.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("id-ID", { weekday: "short" });
    const icon = day.weather[0].icon;
    const temp = Math.round(day.main.temp);
    const unitSymbol = isMetric ? "°C" : "°F";

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
  }, 300000); // 5 menit
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

// --- Favorites System ---

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
      item.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${city}`;
      
      item.onclick = () => {
        commitSearch(city); // Langsung load & bersihkan input
      };
      
      listContainer.appendChild(item);
    });
  } else {
    if(emptyState) emptyState.classList.remove("hidden");
  }
}

function addFavorite(city) {
  let favorites = JSON.parse(localStorage.getItem("weatherFavorites")) || [];
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
  
  // Normalisasi string agar pencarian akurat
  const isSaved = favorites.some(fav => fav.toLowerCase() === city.toLowerCase());

  if (isSaved) {
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