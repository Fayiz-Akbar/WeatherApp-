# WeatherByFayiz

## Deskripsi Singkat
WeatherByFayiz adalah aplikasi dashboard cuaca berbasis web yang modern dan responsif. Aplikasi ini dirancang untuk menampilkan informasi cuaca real-time dan prakiraan (forecast) 5 hari ke depan untuk berbagai kota di seluruh dunia. Dibangun menggunakan teknologi web standar (HTML, CSS, JavaScript) dan memanfaatkan integrasi API eksternal, Website ini menawarkan pengalaman pengguna yang interaktif dengan fitur personalisasi seperti mode gelap dan penyimpanan kota favorit.

## Fitur Utama Pada Website Ini

Berikut adalah daftar fitur lengkap yang telah diimplementasikan:

1. Pemantauan Cuaca Real-Time

-Menampilkan suhu saat ini, kondisi cuaca (ikon & deskripsi), kelembapan, dan kecepatan angin.
-Data diperbarui secara otomatis setiap 5 menit.

2. Prakiraan Cuaca 5 Hari (5-Day Forecast)

-Menyajikan ringkasan prediksi cuaca untuk 5 hari ke depan.
-Menampilkan suhu harian dan ikon kondisi visual.

3. Pencarian Cerdas (Smart Auto-complete)

-Kolom pencarian dilengkapi fitur auto-complete yang memberikan saran nama kota secara real-time saat pengguna mengetik.
-Menggunakan teknik debounce untuk efisiensi permintaan data ke server.

4. Manajemen Kota Favorit

-Pengguna dapat menyimpan kota yang sering dipantau ke dalam daftar favorit.
-Akses cepat ke cuaca kota favorit hanya dengan satu kali klik melalui sidebar.
-Data tersimpan secara permanen di browser (Local Storage) sehingga tidak hilang saat halaman di-refresh.

5. Personalisasi Tampilan (Dark/Light Mode)

-Fitur penggantian tema antarmuka antara Mode Terang (Clean White) dan Mode Gelap (Dark Navy).
-Preferensi tema disimpan otomatis sesuai pilihan terakhir pengguna.

6. Konversi Satuan Suhu

-Tombol toggle interaktif untuk mengubah satuan suhu antara Celsius (°C) dan Fahrenheit (°F).

7. Desain Responsif (Glassmorphism)

-Tampilan antarmuka yang menyesuaikan ukuran layar (Desktop, Tablet, dan Mobile).
-Menggunakan gaya desain modern yang bersih dan minimalis.
