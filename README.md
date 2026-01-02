# GSM Motor E-Commerce Platform

GSM Motor is a specialized e-commerce platform for motorcycle spare parts and accessories. Built with a focus on speed, mobile responsiveness, and ease of management for 1300+ product SKUs.

## 🚀 Key Features

-   **Catalog Management**: Advanced product management with multi-image support.
-   **Smart Search**: Typo-tolerant and multi-word smart matching for finding spare parts easily.
-   **Grosir (Tiered Pricing)**: Wholesale pricing tiers (e.g., special rates for buying 3 or 5 items).
-   **Dynamic Banners**: Home page slider for promotions and announcements.
-   **Smart Image Processing**: Automatic conversion to **WebP** and intelligent resizing (800x800 for products, 1920px for banners) to ensure fast loading and storage efficiency.
-   **WhatsApp Integration**: "Shopee-style" checkout flow where customers are directed to WhatsApp with pre-filled product details.
-   **Admin Dashboard**:
    *   **RBAC**: Admin and Sub-admin roles.
    *   **Bulk Price Update**: Quickly inflate or deflate prices by a percentage across the entire inventory.
    *   **Stock Alerts**: Real-time widget for monitoring low-stock items.
-   **Mobile First**: Fully responsive design optimized for mobile shopping.

## 🛠️ Technology Stack

-   **Framework**: [Laravel 11](https://laravel.com)
-   **Frontend**: [Livewire 3](https://livewire.laravel.com), [Tailwind CSS](https://tailwindcss.com), [Alpine.js](https://alpinejs.dev)
-   **Database**: MariaDB / MySQL
-   **Image Processing**: [Intervention Image](https://image.intervention.io/)
-   **Icons**: [Lucide Icons](https://lucide.dev)

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/gsm-motor.git
    cd gsm-motor
    ```

2.  **Install dependencies**:
    ```bash
    composer install
    npm install
    ```

3.  **Environment Setup**:
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
    *Configure your database settings in `.env`.*

4.  **Run Migrations & Seeders**:
    ```bash
    php artisan migrate --seed
    ```

5.  **Storage Link**:
    ```bash
    php artisan storage:link
    ```

6.  **Build Assets**:
    ```bash
    npm run dev # or npm run build
    ```

7.  **Serve Application**:
    ```bash
    php artisan serve
    ```

## 📍 Store Information

**Address**: Jl. Puspa III No.37, RT.11/RW.4, Kapuk, Kecamatan Cengkareng, Kota Jakarta Barat, 11720
**WhatsApp**: 081386363979

---
*Developed for GSM Motor - 2026*
