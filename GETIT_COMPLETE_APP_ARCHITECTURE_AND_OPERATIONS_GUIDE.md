# GETIT Nigeria — Complete App Architecture, Total Flow & Operations Manual (Scratch to Pro)

> **Document Scope**: This manual documents the complete end-to-end architecture, user journeys, business logic, algorithms, data models, and operational details of the **GETIT Nigeria** platform across the Mobile App (`mobile/App.js`), 3-Level Marketplace Taxonomy Engine (`mobile/data/marketplaceTaxonomy.js`), Real-Time Cloud Sync Layer (`mobile/services/supabaseService.js`), Push & Audio Notification Engine (`mobile/services/pushNotificationService.js`, `mobile/services/notificationService.js`), and Web Admin Console (`src/components/admin/AdminDashboard.jsx`).

---

## 1. Executive Overview & Core Architecture

**GETIT Nigeria** is a multi-vertical, hyper-local commerce, specialist retail, and tele-pharmacy marketplace engineered for Nigerian cities (Abuja & Lagos). Unlike generic delivery apps that lump every vendor into one broad "groceries" bucket, GETIT classifies every shop according to **what it actually sells and specialises in**, connects buyers and merchants over a **sub-50ms 3-layer real-time synchronization engine**, and orchestrates **multi-store sequential courier dispatch** with deterministic wall-clock GPS tracking.

### Core Codebase Modules

| File / Module | Role & Responsibilities |
| :--- | :--- |
| `mobile/App.js` | Complete Unified Mobile Application (Shopper Portal, Guided 3-Step Merchant Registration, Merchant Hub, Tele-Pharmacy Suite, Multi-Store Cart & Map, Real-Time Courier Glider, Chat & Voice Note Studio, In-App Admin Taxonomy Manager). |
| `mobile/data/marketplaceTaxonomy.js` | 3-Level Marketplace Taxonomy (Departments -> Subcategories -> Varieties), Store Type Formats, Category-Specific Cover Image Gallery, Store-Category Product Catalogs, Product Auto-Classifier, and Store Relevance Scoring Engine. |
| `mobile/services/supabaseService.js` | Cloud PostgreSQL CRUD, JSONB Metadata Packing (`city` & `bolt_rider` columns), Duplicate Store Guard, WebSocket Broadcast Queue, and Offline Retry Queue. |
| `mobile/data/pharmacyCatalog.js` | Master Nigerian Pharmaceutical Catalog (`MASTER_PHARMACY_INVENTORY`) across 9 clinical categories (Antimalarials, Analgesics, Antibiotics, Vitamins, Medical Devices, etc.). |
| `mobile/data/nigerianGroceriesCatalog.js` | Master Nigerian Supermarket & Provisions Catalog with suggested Naira prices and price ranges. |
| `mobile/services/pushNotificationService.js` | Physical device-to-device Expo Push API relay (`https://exp.host/--/api/v2/push/send`) for waking locked merchant and customer phones. |
| `src/components/admin/AdminDashboard.jsx` | Web Admin Control Center for managing all 3 taxonomy levels, store formats, merchant category requests, and regulated pharmacy PCN compliance. |

---

## 2. Authentication, Tri-Mode Identity & Duplicate Prevention

### 2.1 Single Account, Multi-Role & Multi-Branch Architecture
- **One Phone Number, Seamless Switching**: A single user account can act as a **Shopper (Buyer)**, own a **Specialist Store / Supermarket**, and own a **Licensed Community Pharmacy** simultaneously.
- **Strict Account Isolation**:
  - **Buyer Side**: `myCustomerOrders` isolates orders strictly matching `currentUser.id`, `currentUser.email`, or the 10-digit suffix of `currentUser.phone`. New accounts start with `0` orders and `₦0` wallet history.
  - **Merchant Side**: `merchantOrders` and the top **Branch Switcher Strip** only show stores and orders owned by the logged-in merchant.
- **Anti-Freeze Loading Locks**:
  - Every authentication and wizard button uses `authSubmitLockRef`, `isAuthSubmitting`, and `isWizardStepLoading` to display an immediate spinner (`Checking & Registering Store...`, `Loading Step 2...`) and block accidental double-taps.
- **Strict Duplicate Store Prevention**:
  - Both `handleAuthSellerSignUp` and `createDatabaseStore` check local and live Supabase `stores` case-insensitively before creating any store. If a store with the same name already exists, registration is blocked with a `"Store Already Exists"` alert.

---

## 3. The 3-Level Marketplace Taxonomy & Specialisation Engine

Implemented in `mobile/data/marketplaceTaxonomy.js`, GETIT organizes the entire marketplace into a **3-Level Hierarchy** plus **Store Format Classifications**:
- **Level 1**: Main Department (e.g., `🥩 Meat & Poultry`)
- **Level 2**: Subcategory (e.g., `🐐 Goat Meat`)
- **Level 3**: Specific Variety / Cut (e.g., `Fresh Goat Meat`, `Goat Ribs`, `Goat Head (Isi Ewu)`, `Goat Offal`)

### 3.1 Level 1: Main Marketplace Departments (16 Departments)
1. **🛒 Grocery & Provisions** (`grocery`): Supermarkets, mini-marts, pantry provisions, dairy, oil & spices.
2. **🥩 Meat & Poultry** (`meat_poultry`): Butchers, abattoir outlets, beef, goat meat, ram/sheep, chicken, turkey, duck, pork.
3. **🥬 Vegetables** (`vegetables`): Fresh farm greens, tomatoes, peppers, onions, carrots, spinach, ugwu, ewedu, okra, salad vegetables.
4. **🍎 Fruits** (`fruits`): Citrus, apples, bananas, mangoes, watermelon, pineapple, pawpaw, berries, avocados.
5. **🐟 Fish & Seafood** (`fish_seafood`): Live & fresh catfish, tilapia, croaker, titus/mackerel, prawns, crayfish, stockfish (okporoko), smoked fish.
6. **💊 Pharmacy & Healthcare** (`pharmacy`): *Regulated PCN Department* — Malaria & fever, pain relief, cough/cold, antibiotics (Rx), vitamins, BP/glucose monitors, tele-pharmacy consultation.
7. **🥐 Bakery & Confectionery** (`bakery`): Agege & sliced bread, celebration cakes, meat pies, sausage rolls, doughnuts, croissants.
8. **🌾 Grains & Foodstuff** (`grains_foodstuff`): Bagged rice (foreign & local ofada), beans (oloyin, drum), garri (Ijebu, yellow), semovita, yam flour (elubo), palm oil, egusi, ogbono.
9. *Expansion Departments*: **🥤 Drinks & Beverages**, **🧼 Household Products**, **✨ Personal Care & Beauty**, **🍼 Baby Products**, **🧊 Frozen Foods**, **🔌 Electronics & Gadgets**, **👗 Fashion & Apparel**, **📦 General Merchandise**.

### 3.2 Store Format Classifications (`DEFAULT_STORE_TYPES`)
Customers can also filter directly by store format:
- `all`: **All Stores**
- `supermarket`: **Supermarkets** (Grocery & multi-department retail hubs)
- `butcher_shop`: **Butcher & Meat Shops**
- `vegetable_shop`: **Vegetable Vendors**
- `fruit_shop`: **Fruit Vendors**
- `fish_shop`: **Fish & Seafood Shops**
- `pharmacy`: **Licensed Pharmacies**
- `bakery_shop`: **Bakeries & Pastry Shops**
- `grains_shop`: **Grains & Foodstuff Stores**
- `provision_store`: **Mini-Marts & Provision Stores**

### 3.3 Strict Store Categorization & Relevance Ranking (`evaluateStoreAgainstTaxonomyFilter`)
- **Strict Primary Department Isolation**: A specialist store (such as a Butcher Shop with `primaryDepartmentId: 'meat_poultry'`) only appears under **Meat & Poultry** (in Option A) and **Butcher & Meat Shops** (in Option B). It will **never** bleed into **Supermarkets** or **Grocery & Provisions** unless it explicitly stocks grocery products or is registered as a supermarket.
- **Relevance Tier Scoring**:
  - **Tier 1 (`🔥 Specialist`, Score +100)**: The store's primary department matches the customer's selected department, plus +60 for exact subcategory specialization and +50 for exact product variety match.
  - **Tier 2 (`🏪 Also Stocks This`, Score +45)**: Multi-department stores that genuinely carry matching products in their inventory.
  - **Tier 3 (`📦 Stocked Item`, Score +35)**: Matched via live catalog search.

---

## 4. Guided 3-Step Merchant Registration Flow (With Images & Live GPS Location)

When a shop owner taps **Register Store** in the Merchant Portal, they are guided through an interactive **3-Step Registration Wizard**:

### Step 1: Business Type, Store Format & Category Cover Image
1. **Primary Business Department**: Merchant selects what kind of business they operate (Grocery & Provisions, Meat & Poultry Shop, Vegetable Shop, Fruit Shop, Fish & Seafood Shop, Pharmacy, Bakery, Grains & Foodstuff, etc.).
2. **Store Format Pill**: Automatically selects the matching store format (e.g. `Butcher & Meat Shop` for Meat & Poultry, `Supermarket` for Grocery) with manual override pills.
3. **Category-Tailored Storefront Cover Image Gallery + Custom Upload**:
   - Defined in `CATEGORY_STORE_COVER_GALLERY`, each department displays curated storefront photos matching that exact category (e.g., butcher shop images for meat shops, fresh vegetable stalls for vegetable shops, supermarkets for grocery stores, pharmacies for health stores).
   - **📷 Upload Custom Button**: Merchants can also tap **`Upload Custom`** (`handlePickCustomRegistrationImage`) to pick their own shop photograph from their phone gallery.

### Step 2: Specialisation & Level-3 Product Varieties
1. **Subcategory Multi-Select**: A butcher shop selects whether they specialise in **Goat Meat**, **Beef / Cow Meat**, **Ram & Sheep**, **Poultry (Chicken / Turkey / Duck)**, **Pork**, or taps **Select All**.
2. **Level-3 Specific Cuts / Varieties**: Displays specific varieties for the selected subcategories (e.g. *Fresh Goat Meat, Goat Ribs, Goat Head (Isi Ewu), Goat Offal, Cow Meat, Beef Ribs, Beef Liver, Whole Chicken, Chicken Wings, Gizzard*).
3. **Regulated Pharmacy PCN Compliance Box**: If the business is a **Pharmacy**, Step 2 displays the mandatory regulatory onboarding fields:
   - Superintendent / On-Duty Pharmacist Name
   - PCN Pharmacist License Number
   - PCN Premises Registration Number
   - Pharmacist Qualification (`B.Pharm, MPSN`)

### Step 3: Additional Departments, Store Details & Interactive GPS Location Setup
1. **"Do you sell other products too?"**: Optional toggle allowing mixed stores or supermarkets to declare secondary departments.
2. **Store & Owner Credentials**: Store/Pharmacy Name, Owner/Manager Name, Phone/WhatsApp Number, Business Email, and Password.
3. **📍 Set Store Location & GPS Pin (Required During Registration)**:
   - **District / Zone Quick Selector (`REGISTRATION_STORE_DISTRICTS`)**: 17 quick-select pills across Abuja (`Maitama`, `Wuse 2`, `Gwarinpa`, `Jabi`, `Asokoro`, `Garki`, `Utako`, `Guzape`, `Katampe`, `Apo`, `CBD`, `Kubwa`, `Lugbe`) and Lagos (`VI Lagos`, `Lekki Ph1`, `Ikoyi`, `Ikeja GRA`). Tapping a pill pans the map pin to that district.
   - **Street Address / Plaza / Landmark Input**: Text field for the physical shop address.
   - **🎯 Use Live GPS Button (`handleDetectRegistrationGps`)**: Acquires live phone GPS coordinates via `expo-location`, moves the map pin to the merchant's current location, and reverse-geocodes the street/district automatically.
   - **Interactive Mini-Map & Fullscreen Map Modal (`renderRegistrationMapModal`)**: Embedded `MapView` with a draggable green storefront pin, `➕`/`➖` zoom controls, live coordinate badge (`🎯 Pinned: 9.0882° N, 7.4933° E`), and a **`📍 Pin on Fullscreen Map ➔`** modal for precision placement.

---

## 5. Shopper Portal — Dual Discovery, Multi-Store Cart & Live Tracking

### 5.1 Option A vs. Option B Dual Shopping Experience
Customers have two ways to find shops on the home screen:
1. **Option A: Shop by Product Category (`customerBrowseMode === 'product'`)**:
   - **"What are you shopping for?" Visual Spotlight Grid**: Starts with **Supermarkets / All Departments** first, followed by high-demand visual cards (**Goat Meat**, **Chicken & Poultry**, **Fresh Beef**, **Vegetables**, **Fruits**, **Fish & Seafood**, **Rice, Beans & Grains**, **Bread & Bakery**, **Pharmacy & Meds**).
   - **3-Level Drill-Down**: Selecting a spotlight or Level-1 department reveals Level-2 subcategory pills (e.g., *Goat Meat, Beef, Ram, Poultry*) and Level-3 cut/variety pills (*Fresh Goat Meat, Goat Ribs, Goat Head*).
   - **Specialist Store Ranking**: Matching stores are badged with **`🔥 Specialist`** or **`🏪 Also Stocks This`** and display up to 3 specialisation pills on each store card.
2. **Option B: Browse by Store Type (`customerBrowseMode === 'store_type'`)**:
   - Horizontal filter pills for **All Stores**, **Supermarkets**, **Butcher & Meat Shops**, **Vegetable Vendors**, **Fruit Vendors**, **Fish & Seafood Shops**, **Licensed Pharmacies**, **Bakeries**, **Grains & Foodstuff Stores**, and **Provision Stores**.
3. **Interactive Buyer Explore Map (`storeDisplayMode === 'map'`)**:
   - Buyers can switch between **List View** and **Map View** to see all nearby stores plotted at their actual pinned GPS coordinates relative to the buyer's live blue GPS dot and pinned delivery address.

### 5.2 Store Operating Hours & Animated Closed Storefront Doors
- **Schedule Evaluation (`isStoreCurrentlyOpen`)**: Evaluates the merchant's live toggle (`isOpen`), 24-hour flag (`is24Hours`), operating days (`Daily`, `Mon - Sat`, `Mon - Fri`, `Weekends Only`), and opening/closing hours.
- **Luxury Animated Double Doors (`AnimatedStoreDoor`)**: When a store is closed, opening its profile triggers a smooth spring-physics animation where double French doors slide shut, a golden padlock (`🔒 LOCKED`) snaps into place, and a wooden sign (`⛔ SORRY, WE'RE CLOSED`) sways like a pendulum. Buyers can tap **`🚪 Knock on Door`** for a vibration shake and schedule bubble while browsing the catalog in read-only mode (checkout/add-to-cart is blocked while closed).

### 5.3 Multi-Store Basket, Inbound Funnel Dispatch & Sequential Routing
- **Multi-Store Cart Grouping (`cartGroupedByStore`)**: Buyers can add items from multiple specialist shops (e.g., Goat meat from *Mega Butcher Shop* + Vegetables from *Fati's Fresh Mart* + Malaria meds from *Basit Pharm*) into a single basket.
- **Inbound Funnel Dispatch Engine (`calculateInboundFunnelDispatch`)**:
  - Automatically identifies the **Outermost Anchor Store** (furthest from the buyer's home pin), dispatches the nearest fleet courier (`FLEET_COURIERS`) to Stop 1 first, and sequences remaining pickups inward toward the buyer's home so the courier never backtracks.
  - Buyers can also manually reorder stop sequence using **`⇅ Reverse Sequence`** or per-store **`▲` / `▼`** buttons on the basket map.
- **Transparent Multi-Stop Pricing**:
  - Base distance-calculated delivery fee + **`₦700` per additional store pickup** (`multiStopCount * 700`).
  - Interactive resizable basket map (`220px` compact ↔ `390px` tall ↔ Fullscreen overlay) showing numbered store pins (`[1] 🏪`, `[2] 🏪`), amber shop-to-shop dashed polylines, and the emerald final delivery polyline to `🏠 HOME`.

### 5.4 Live Turn-by-Turn Order Tracking & Wall-Clock Deterministic Glider
- **Single Active Road Leg Map**: On the Buyer **Orders** tab, active orders display an expanded Google Maps-style navigation view showing **only the current active road leg** (snapped to real streets via OSRM `fetchRealRoadDirections`):
  - **Stage 0**: Courier Origin -> Stop 1
  - **Stage 1**: Stop 1 -> Stop 2
  - **Stage 2**: Final Stop -> Customer Home (`🏠`)
- **Deterministic Wall-Clock Motorbike Engine (`calculateOrderRiderProgress`)**:
  - Uses `legStartedAt` persisted in Supabase so even if the phone is locked, minimized, or closed, reopening the app immediately calculates `elapsedMs = Date.now() - legStartedAt` and positions the `🛵` motorbike puck at its exact real-time coordinate along the road.
- **Gate Arrival & Master 4-Digit Security PIN**:
  - When the courier reaches the buyer's home (`courierArrivedOutside: true`), a high-priority arrival chime sounds and the buyer verifies handover using their **4-Digit Delivery Security PIN**.
- **Automatic Post-Delivery Dual-Scorecard Review Modal**:
  - Within 600ms of delivery completion, the **Customer Review Modal** pops up automatically so the buyer can rate both the **Store(s)** (1–5 stars + quick tags) and the **Courier** (1–5 stars + optional tip), dynamically recalculating the store's rating in Supabase.

---

## 6. Merchant Hub — Operations, Category-Scoped Catalog, Stock Filters & Payouts

When logged in as a Merchant (`appMode === 'merchant'`), the bottom navigation bar provides 5 specialized workspaces:

### 6.1 Tab 1: Live Store Orders (`merchantTab === 'orders'`)
- **Status Pipeline Tabs**: Organized as **`New`** (default) -> **`Preparing`** -> **`Ready`** -> **`Done`** -> **`All`**, plus an instant search bar filtering by Order ID, Customer Name, Phone, or Item Name.
- **1-Minute Recurring Audio & Push Reminders**:
  - Unaccepted `New` orders trigger a loud multi-tone cash-register chime (`C5 -> E5 -> G5 -> C6`) every 60 seconds until the merchant taps **Accept Order**.
  - Accepted `Preparing` orders trigger a preparation reminder every 60 seconds until marked **Ready for Pickup**.
- **Out-of-Stock Item Replacement & Refund Workflow**:
  - If an ordered item is unavailable, the merchant can tap **Replace / Out of Stock** on that line item to propose a substitute item (with automatic price difference calculation) or issue an instant line-item refund. The buyer receives a real-time interactive approval banner with a 60-second countdown.
- **Zero-Map Linear Courier Tracker (`MerchantStraightLineTracker`)**:
  - Once an order is marked `Ready for Pickup`, the merchant card renders a clean linear progress track (`[🛵 Rider] ────► [🏪 Your Shop]`) showing real-time road distance remaining and ETA (`⏱️ ~2 mins • 0.8 km away`). When the courier arrives and collects the package, the stop automatically transitions to **`Done (Completed)`**.

### 6.2 Tab 2: Catalog & Inventory (`merchantTab === 'inventory'`)
- **Clickable Stock Status Filter Cards**:
  - **🟢 In Stock Card**: Tapping filters the catalog to show only available items (`merchantInventoryStockFilter === 'in_stock'`).
  - **🔴 Out of Stock Card**: Tapping highlights the card in red (`● Out of Stock`) and filters the list to show **only out-of-stock goods** so the merchant can restock them immediately. Includes a **`Restock All ✓`** button (`restockAllOutOfStock`) in the filter banner as well as individual **`Restock ✓`** buttons on each item card.
  - **📊 Total Items Card**: Tapping resets the view to show all products (`'all'`).
- **Store-Category Scoped Product Suggestions (`+ Add Product` Modal)**:
  - Powered by `getStoreScopedCatalogAndCategories` and `STORE_CATEGORY_SUGGESTED_PRODUCTS`.
  - The **`+ Add Product`** modal **only suggests categories and products that belong to that store's registered department**:
    - A **Butcher / Meat Shop** only sees meat categories (*Goat Meat, Beef / Cow Meat, Ram & Sheep, Poultry, Offal & Assorted*) and meat items — never pharmacy drugs, soft drinks, or unrelated groceries.
    - A **Vegetable Shop** only sees vegetable categories (*Tomatoes & Peppers, Leafy Greens, Onions & Roots, Salad Vegetables*).
    - A **Fruit Shop** only sees fruit categories (*Citrus & Oranges, Tropical Fruits, Apples, Melons & Berries*).
    - A **Fish & Seafood Shop** only sees fish categories (*Fresh Fish, Smoked & Dried Fish, Prawns, Crayfish & Stockfish*).
    - A **Bakery** only sees bakery categories (*Bread & Loaves, Cakes & Slices, Meat Pies & Pastries*).
    - A **Grains & Foodstuff Store** only sees bulk foodstuff categories (*Rice, Beans & Grains, Garri, Yam & Swallow Flours, Cooking Oils & Soup Ingredients*).
    - A **Pharmacy** only sees clinical medication categories from `MASTER_PHARMACY_INVENTORY`.
    - Both the **Suggested Catalog** tab and the **Custom Item** category pills are strictly scoped to the store's department.
- **Bulk POS / Spreadsheet Import**: Supports `.csv`, `.srt`, `.txt`, and pasted POS inventory lists for onboarding dozens of items in seconds.

### 6.3 Tab 3: Tele-Pharmacy & Store Messages (`merchantTab === 'messages'`)
- **Segmented Inbox**: Displays **`💬 Messages`** and **`📞 Call Log`** with real-time unread badges.
- **Full Multi-Media Chat Studio**:
  - **Text & Contextual Quick-Reply Chips**: Role-specific 1-tap replies for merchants, pharmacists, customers, and couriers.
  - **🎙️ Voice Note Studio (`expo-audio` + `expo-file-system`)**: Records 16kHz AAC voice notes, encodes them as portable base64 (`voiceNoteBase64`), and unpacks them to `.m4a` files on the recipient's device for instant loudspeaker playback with animated waveform bars.
  - **📷 Camera & Prescription Photo Studio (`expo-image-picker`)**: Sends portable base64 prescription photos directly in chat bubbles with an official `📷 Doctor Prescription` badge.
- **🩺 Pharmacist "Prescribe Medication & Bill Patient" Studio**:
  - Exclusively visible to verified pharmacy merchants (`storeType === 'pharmacy'`).
  - Pharmacists search their drug catalog, set quantities, write clinical dosage instructions (e.g., *"1 tablet every 12 hours after meals for 5 days"*), and send an interactive **℞ Prescription Invoice Card** into the patient's chat.
  - The patient taps **`💳 Accept & Pay ₦X,XXX`** right inside the chat bubble, which processes payment and converts the prescription into an active, tamper-sealed delivery order with real road routing.

### 6.4 Tab 4: Finances, 90/10 Split & Bank Withdrawals (`merchantTab === 'finances'`)
- **Transparent Settlement Ledger**: Merchants earn **90%** of their store's item subtotal on every completed order (10% platform commission).
- **Nigerian Bank Account Setup**: Supports Zenith Bank, GTBank, Access Bank, First Bank, UBA, Kuda, OPay, and Moniepoint (`getit_merchant_bank_info`).
- **Instant Bank Withdrawal & Payout History**: Merchants can request withdrawals using quick-amount chips (`₦5,000`, `₦10,000`, `₦25,000`, `Full Balance`), generating settled Paystack reference records in `getit_merchant_payouts`.
- **Classy Visual Digital Receipt & PDF Export**: Both merchants and buyers can view the watermarked **GETIT Privilège Dispatch Tax Invoice**, share it to WhatsApp, or export/print a PDF via `expo-print` & `expo-sharing`.

### 6.5 Tab 5: Store Profile, Live/Pause Switch, Operating Schedule & GPS Pin (`merchantTab === 'store'`)
- **Instant Live / Paused Switch (`handleToggleStoreLive`)**: Toggling the store open/closed broadcasts `STORE_UPDATE` over WebSockets in under 50ms, immediately updating map pins and opening/closing the animated double storefront doors on all buyer phones.
- **Operating Hours & Days Editor**: Supports `24 Hours` mode or custom opening/closing times across `Daily`, `Mon - Sat`, `Mon - Fri`, or `Weekends Only`.
- **Storefront Photo, Specialisation & GPS Pin Editor**: Merchants can update their cover image, edit their 3-level category specialisation (`merchantTaxonomyModalVisible`), or adjust their storefront GPS pin on the interactive mini-map / fullscreen map modal.

---

## 7. Real-Time Cloud Sync & Database Schema (Supabase)

Managed by `mobile/services/supabaseService.js`, GETIT uses a **3-Layer Real-Time Architecture**:
1. **Layer 1 — Sub-50ms WebSocket Broadcast (`getit_live_sync_channel`)**: Instant peer-to-peer events (`STORE_UPDATE`, `INVENTORY_UPDATE`, `ORDER_INSERT`, `ORDER_UPDATE`, `CHAT_MESSAGE`, `PRESCRIPTION_PAID`, `TAXONOMY_UPDATE`) with an in-memory pre-subscription queue (`pendingBroadcastMessages`).
2. **Layer 2 — PostgreSQL Changes Replication**: Live table listeners on `public:stores` and `public:store_inventory`.
3. **Layer 3 — 15s Silent Background Heartbeat & Offline Queue**: Reconciles stores and orders silently on a 15-second interval and upon `AppState` foreground resume, flushing any offline orders stored in `getit_pending_order_syncs`.

### Production Supabase Tables

| Table Name | Primary Key | Key Columns & JSONB Packing |
| :--- | :--- | :--- |
| `stores` | `id` (text) | `name`, `category`, `store_type`, `address`, `district`, `latitude`, `longitude`, `phone`, `delivery_fee`, `is_open`, `rating`, plus rich metadata packed into `city` JSON (`primaryDepartmentId`, `storeTypeFormat`, `specialisationSubcategories`, `specialisationProducts`, `additionalDepartmentIds`, `pharmacist`, `image`, `openTime`, `closeTime`, `operatingDays`, `is24Hours`). |
| `store_inventory` | `id` (text) | `store_id`, `name`, `category`, `price`, `icon`, `image_url`, `out_of_stock`, `created_at`. |
| `orders` | `id` (text) | `customer_id`, `customer_name`, `customer_phone`, `store_id`, `store_name`, `items` (JSONB), `total_amount`, `status`, `delivery_address`, `delivery_pin`, plus multi-stop logistics & chat packed into `bolt_rider` JSONB (`stops`, `roadRouteCoordinates`, `roadLegs`, `legStartedAt`, `currentStopIndex`, `messages`, `replacementProposal`, `courierArrivedOutside`). |
| `users` | `id` (uuid/text) | `full_name`, `phone`, `email`, `password`, `role` (`buyer` / `seller`), `business_name`, `store_id`, `address`. |
| `riders` | `id` (text) | `name`, `phone`, `vehicle_type`, `license_plate`, `rating`, `latitude`, `longitude`, `status`. |
| `audit_logs` | `id` (uuid) | `event_type`, `user_identifier`, `metadata` (JSONB), `created_at`. |

