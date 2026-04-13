-- ─────────────────────────────────────────────────────────────────────────────
-- Velora Commerce — Seed Data
-- Run in Supabase SQL Editor AFTER 001, 002, 003 migrations.
-- Uses picsum.photos for placeholder images (no API key needed).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── CATEGORIES ───────────────────────────────────────────────────────────────

insert into public.categories (id, slug, sort_order, is_active, translations) values
(
  'a1000000-0000-0000-0000-000000000001',
  'electronics',
  1,
  true,
  '{
    "en": { "name": "Electronics", "description": "Latest gadgets and tech accessories" },
    "uz": { "name": "Elektronika", "description": "Eng yangi gadjetlar va texnik aksessuarlar" },
    "ru": { "name": "Электроника", "description": "Новейшие гаджеты и технические аксессуары" }
  }'
),
(
  'a1000000-0000-0000-0000-000000000002',
  'fashion',
  2,
  true,
  '{
    "en": { "name": "Fashion", "description": "Premium clothing and accessories" },
    "uz": { "name": "Moda", "description": "Premium kiyimlar va aksessuarlar" },
    "ru": { "name": "Мода", "description": "Премиальная одежда и аксессуары" }
  }'
),
(
  'a1000000-0000-0000-0000-000000000003',
  'home-living',
  3,
  true,
  '{
    "en": { "name": "Home & Living", "description": "Elevate your living space" },
    "uz": { "name": "Uy va Hayot", "description": "Yashash joyingizni yaxshilang" },
    "ru": { "name": "Дом и Быт", "description": "Улучшите свое жилое пространство" }
  }'
),
(
  'a1000000-0000-0000-0000-000000000004',
  'sports',
  4,
  true,
  '{
    "en": { "name": "Sports", "description": "Gear for every athlete" },
    "uz": { "name": "Sport", "description": "Har bir sportchi uchun jihozlar" },
    "ru": { "name": "Спорт", "description": "Снаряжение для каждого атлета" }
  }'
),
(
  'a1000000-0000-0000-0000-000000000005',
  'beauty',
  5,
  true,
  '{
    "en": { "name": "Beauty", "description": "Skincare, makeup and wellness" },
    "uz": { "name": "Go''zallik", "description": "Terini parvarish qilish, makiyaj va salomatlik" },
    "ru": { "name": "Красота", "description": "Уход за кожей, макияж и здоровье" }
  }'
),
(
  'a1000000-0000-0000-0000-000000000006',
  'books',
  6,
  true,
  '{
    "en": { "name": "Books", "description": "Expand your mind" },
    "uz": { "name": "Kitoblar", "description": "Fikringizni kengaytiring" },
    "ru": { "name": "Книги", "description": "Расширьте свой кругозор" }
  }'
)
on conflict (id) do nothing;

-- ── PRODUCTS ─────────────────────────────────────────────────────────────────

insert into public.products
  (id, sku, price, compare_price, stock, images, category_id, brand, tags, is_active, is_featured, translations)
values

-- ── Electronics ──────────────────────────────────────────────────────────────

(
  'b1000000-0000-0000-0000-000000000001',
  'ELEC-WH-001',
  149.00, 199.00, 45,
  array[
    'https://picsum.photos/seed/wh1/800/800',
    'https://picsum.photos/seed/wh2/800/800',
    'https://picsum.photos/seed/wh3/800/800'
  ],
  'a1000000-0000-0000-0000-000000000001',
  'SoundWave',
  array['wireless', 'headphones', 'audio', 'noise-cancelling'],
  true, true,
  '{
    "en": { "title": "SoundWave Pro Wireless Headphones", "description": "Experience premium audio with 40-hour battery life, active noise cancellation, and studio-quality sound. Foldable design perfect for travel.", "slug": "soundwave-pro-wireless-headphones" },
    "uz": { "title": "SoundWave Pro Simsiz Quloqchinlar", "description": "40 soatlik batareya quvvati, faol shovqinni bekor qilish va studiya sifatidagi ovoz bilan premium audiodni his eting.", "slug": "soundwave-pro-wireless-headphones" },
    "ru": { "title": "Беспроводные наушники SoundWave Pro", "description": "Ощутите премиальный звук с 40-часовым аккумулятором, активным шумоподавлением и студийным качеством звука.", "slug": "soundwave-pro-wireless-headphones" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000002',
  'ELEC-SW-002',
  299.00, null, 30,
  array[
    'https://picsum.photos/seed/sw1/800/800',
    'https://picsum.photos/seed/sw2/800/800'
  ],
  'a1000000-0000-0000-0000-000000000001',
  'TechPulse',
  array['smartwatch', 'fitness', 'wearable', 'health'],
  true, true,
  '{
    "en": { "title": "TechPulse Smart Watch Series 5", "description": "Track your fitness goals with heart rate monitoring, GPS, sleep tracking and 7-day battery. Water-resistant to 50 meters.", "slug": "techpulse-smart-watch-series-5" },
    "uz": { "title": "TechPulse Aqlli Soat Seriya 5", "description": "Yurak urish monitoringi, GPS, uyqu kuzatuvi va 7 kunlik batareya bilan fitness maqsadlaringizni kuzating.", "slug": "techpulse-smart-watch-series-5" },
    "ru": { "title": "Умные часы TechPulse Series 5", "description": "Отслеживайте фитнес-цели с мониторингом сердечного ритма, GPS, отслеживанием сна и 7-дневным аккумулятором.", "slug": "techpulse-smart-watch-series-5" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000003',
  'ELEC-KB-003',
  89.00, 120.00, 60,
  array[
    'https://picsum.photos/seed/kb1/800/800',
    'https://picsum.photos/seed/kb2/800/800'
  ],
  'a1000000-0000-0000-0000-000000000001',
  'KeyCraft',
  array['keyboard', 'mechanical', 'gaming', 'rgb'],
  true, false,
  '{
    "en": { "title": "KeyCraft Mechanical Gaming Keyboard", "description": "Tactile mechanical switches with per-key RGB lighting, anti-ghosting, and aluminum frame. Built for precision gaming and professional typing.", "slug": "keycraft-mechanical-gaming-keyboard" },
    "uz": { "title": "KeyCraft Mexanik Gaming Klaviaturasi", "description": "Har bir kalit uchun RGB yoritish, anti-ghosting va alyuminiy ramka bilan taktil mexanik kalitlar.", "slug": "keycraft-mechanical-gaming-keyboard" },
    "ru": { "title": "Механическая игровая клавиатура KeyCraft", "description": "Тактильные механические переключатели с RGB-подсветкой каждой клавиши, антиprisonnière и алюминиевой рамкой.", "slug": "keycraft-mechanical-gaming-keyboard" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000004',
  'ELEC-TWS-004',
  79.00, null, 100,
  array[
    'https://picsum.photos/seed/tws1/800/800',
    'https://picsum.photos/seed/tws2/800/800',
    'https://picsum.photos/seed/tws3/800/800'
  ],
  'a1000000-0000-0000-0000-000000000001',
  'SoundWave',
  array['earbuds', 'wireless', 'bluetooth', 'compact'],
  true, false,
  '{
    "en": { "title": "SoundWave AirPods True Wireless Earbuds", "description": "Crystal clear sound in a compact form. 6-hour playtime with 24 more in the case. IPX5 water resistance and touch controls.", "slug": "soundwave-airpods-true-wireless-earbuds" },
    "uz": { "title": "SoundWave AirPods Haqiqiy Simsiz Quloqchinlar", "description": "Ixcham shaklda tiniq ovoz. Qutida 24 soat qo''shimcha bilan 6 soat o''ynash vaqti.", "slug": "soundwave-airpods-true-wireless-earbuds" },
    "ru": { "title": "Беспроводные наушники SoundWave AirPods", "description": "Кристально чистый звук в компактном исполнении. 6 часов работы плюс 24 часа в кейсе.", "slug": "soundwave-airpods-true-wireless-earbuds" }
  }'
),

-- ── Fashion ──────────────────────────────────────────────────────────────────

(
  'b1000000-0000-0000-0000-000000000005',
  'FASH-JK-005',
  189.00, 250.00, 35,
  array[
    'https://picsum.photos/seed/jk1/800/800',
    'https://picsum.photos/seed/jk2/800/800',
    'https://picsum.photos/seed/jk3/800/800'
  ],
  'a1000000-0000-0000-0000-000000000002',
  'Velora Style',
  array['jacket', 'leather', 'premium', 'outerwear'],
  true, true,
  '{
    "en": { "title": "Premium Leather Biker Jacket", "description": "Genuine full-grain leather jacket with asymmetric zipper, quilted lining, and multiple pockets. A timeless piece that gets better with age.", "slug": "premium-leather-biker-jacket" },
    "uz": { "title": "Premium Charm Biker Kurtka", "description": "Assimetrik fermuar, teshikli astari va bir nechta cho''ntak bilan to''liq donali charm kurtka.", "slug": "premium-leather-biker-jacket" },
    "ru": { "title": "Премиальная кожаная куртка-байкер", "description": "Куртка из натуральной полнозернистой кожи с асимметричной молнией, стёганой подкладкой и множеством карманов.", "slug": "premium-leather-biker-jacket" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000006',
  'FASH-SN-006',
  129.00, null, 80,
  array[
    'https://picsum.photos/seed/sn1/800/800',
    'https://picsum.photos/seed/sn2/800/800',
    'https://picsum.photos/seed/sn3/800/800',
    'https://picsum.photos/seed/sn4/800/800'
  ],
  'a1000000-0000-0000-0000-000000000002',
  'StepUp',
  array['sneakers', 'running', 'sport', 'casual'],
  true, true,
  '{
    "en": { "title": "StepUp CloudFoam Runner Sneakers", "description": "Ultra-lightweight runners with memory foam insole, breathable mesh upper, and slip-resistant outsole. Perfect for daily runs or casual wear.", "slug": "stepup-cloudfoam-runner-sneakers" },
    "uz": { "title": "StepUp CloudFoam Runner Krossovkalar", "description": "Xotira ko''pikli pastki qism, nafas oladigan to''r yuqori qism va sirpanmaydigan tashqi qism bilan ultra yengil yuguruvchilar.", "slug": "stepup-cloudfoam-runner-sneakers" },
    "ru": { "title": "Кроссовки StepUp CloudFoam Runner", "description": "Сверхлёгкие кроссовки с стелькой из пены с эффектом памяти, дышащим сетчатым верхом и нескользящей подошвой.", "slug": "stepup-cloudfoam-runner-sneakers" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000007',
  'FASH-TS-007',
  49.00, 65.00, 200,
  array[
    'https://picsum.photos/seed/ts1/800/800',
    'https://picsum.photos/seed/ts2/800/800'
  ],
  'a1000000-0000-0000-0000-000000000002',
  'Velora Style',
  array['tshirt', 'cotton', 'casual', 'basics'],
  true, false,
  '{
    "en": { "title": "Supima Cotton Premium T-Shirt", "description": "Made from 100% Supima cotton — the softest, strongest cotton in the world. Pre-shrunk, with a relaxed fit that holds its shape wash after wash.", "slug": "supima-cotton-premium-tshirt" },
    "uz": { "title": "Supima Paxtali Premium Futbolka", "description": "Dunyodagi eng yumshoq va eng kuchli paxta - 100% Supima paxtasidan tayyorlangan. Oldindan qisqartirilgan, yuvishdan so''ng shaklini saqlaydigan erkin fit.", "slug": "supima-cotton-premium-tshirt" },
    "ru": { "title": "Премиальная футболка из хлопка Supima", "description": "Изготовлена из 100% хлопка Supima — самого мягкого и прочного хлопка в мире. Предварительно усаженная, свободного кроя.", "slug": "supima-cotton-premium-tshirt" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000008',
  'FASH-WL-008',
  95.00, null, 55,
  array[
    'https://picsum.photos/seed/wl1/800/800',
    'https://picsum.photos/seed/wl2/800/800'
  ],
  'a1000000-0000-0000-0000-000000000002',
  'LuxLeather',
  array['wallet', 'leather', 'slim', 'accessories'],
  true, false,
  '{
    "en": { "title": "LuxLeather Slim Bifold Wallet", "description": "Hand-stitched full-grain leather wallet with RFID blocking. Fits 8 cards and cash without the bulk. Ages beautifully over time.", "slug": "luxleather-slim-bifold-wallet" },
    "uz": { "title": "LuxLeather Yupqa Bifold Hamyon", "description": "RFID blokirovkasi bilan qo''lda tikilgan to''liq donali charm hamyon. Hajmsiz 8 ta karta va naqd pul sig''adi.", "slug": "luxleather-slim-bifold-wallet" },
    "ru": { "title": "Тонкий кошелёк LuxLeather Bifold", "description": "Кошелёк из цельнозернистой кожи ручной работы с RFID-защитой. Вмещает 8 карт и купюры без лишнего объёма.", "slug": "luxleather-slim-bifold-wallet" }
  }'
),

-- ── Home & Living ─────────────────────────────────────────────────────────────

(
  'b1000000-0000-0000-0000-000000000009',
  'HOME-DL-009',
  59.00, 80.00, 120,
  array[
    'https://picsum.photos/seed/dl1/800/800',
    'https://picsum.photos/seed/dl2/800/800',
    'https://picsum.photos/seed/dl3/800/800'
  ],
  'a1000000-0000-0000-0000-000000000003',
  'LumiHome',
  array['lamp', 'desk', 'led', 'smart', 'home'],
  true, true,
  '{
    "en": { "title": "LumiHome Smart Desk Lamp", "description": "Touch-controlled LED desk lamp with 5 colour temperatures, USB-C charging port, and memory function. Eye-care technology reduces flicker and blue light.", "slug": "lumihome-smart-desk-lamp" },
    "uz": { "title": "LumiHome Aqlli Stol Lampasi", "description": "5 ta rang harorati, USB-C zaryadlash porti va xotira funksiyasi bilan sensorli boshqariladigan LED stol lampasi.", "slug": "lumihome-smart-desk-lamp" },
    "ru": { "title": "Умная настольная лампа LumiHome", "description": "Сенсорная светодиодная настольная лампа с 5 цветовыми температурами, портом USB-C и функцией памяти.", "slug": "lumihome-smart-desk-lamp" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000010',
  'HOME-DK-010',
  39.00, null, 200,
  array[
    'https://picsum.photos/seed/dk1/800/800',
    'https://picsum.photos/seed/dk2/800/800'
  ],
  'a1000000-0000-0000-0000-000000000003',
  'AromaLux',
  array['diffuser', 'aroma', 'essential-oils', 'wellness'],
  true, false,
  '{
    "en": { "title": "AromaLux Essential Oil Diffuser", "description": "Ultrasonic diffuser with 7-colour LED mood lighting, auto shut-off, and 300ml capacity. Whisper-quiet for bedrooms and offices.", "slug": "aromalux-essential-oil-diffuser" },
    "uz": { "title": "AromaLux Efir Moyi Diffuzori", "description": "7 rangli LED kayfiyat yoritgichi, avtomatik o''chirish va 300 ml sig''im bilan ultratovush diffuzori.", "slug": "aromalux-essential-oil-diffuser" },
    "ru": { "title": "Диффузор для эфирных масел AromaLux", "description": "Ультразвуковой диффузор с 7-цветной светодиодной подсветкой, автоотключением и ёмкостью 300 мл.", "slug": "aromalux-essential-oil-diffuser" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000011',
  'HOME-CK-011',
  220.00, 299.00, 25,
  array[
    'https://picsum.photos/seed/ck1/800/800',
    'https://picsum.photos/seed/ck2/800/800',
    'https://picsum.photos/seed/ck3/800/800'
  ],
  'a1000000-0000-0000-0000-000000000003',
  'CastIron Co.',
  array['cookware', 'cast-iron', 'kitchen', 'premium'],
  true, false,
  '{
    "en": { "title": "Cast Iron Dutch Oven 5.5 Qt", "description": "Enameled cast iron Dutch oven for braising, slow cooking, and baking. Even heat distribution, oven-safe to 500°F. A kitchen heirloom.", "slug": "cast-iron-dutch-oven-5-5-qt" },
    "uz": { "title": "Quyma Temir Gollandiyacha Pech 5.5 Qt", "description": "Tabaqlash, sekin pishirish va pishirish uchun emallangan quyma temir gollandiyacha pech.", "slug": "cast-iron-dutch-oven-5-5-qt" },
    "ru": { "title": "Чугунная кастрюля Dutch Oven 5.5 Qt", "description": "Эмалированная чугунная кастрюля для тушения, медленного приготовления и выпечки. Равномерное распределение тепла.", "slug": "cast-iron-dutch-oven-5-5-qt" }
  }'
),

-- ── Sports ────────────────────────────────────────────────────────────────────

(
  'b1000000-0000-0000-0000-000000000012',
  'SPRT-YM-012',
  85.00, null, 70,
  array[
    'https://picsum.photos/seed/ym1/800/800',
    'https://picsum.photos/seed/ym2/800/800'
  ],
  'a1000000-0000-0000-0000-000000000004',
  'FlexLife',
  array['yoga', 'mat', 'fitness', 'non-slip'],
  true, false,
  '{
    "en": { "title": "FlexLife Premium Yoga Mat 6mm", "description": "Non-slip, eco-friendly TPE yoga mat with alignment lines, carrying strap, and moisture-resistant surface. 6mm cushioning for joint protection.", "slug": "flexlife-premium-yoga-mat-6mm" },
    "uz": { "title": "FlexLife Premium Yoga Mat 6mm", "description": "Hizalash chiziqlari, ko''tarish qayishi va namga chidamli sirt bilan sirpanmaydigan, ekologik toza TPE yoga mat.", "slug": "flexlife-premium-yoga-mat-6mm" },
    "ru": { "title": "Премиальный коврик для йоги FlexLife 6мм", "description": "Нескользящий экологичный TPE коврик с разметкой, ремнём для переноски и влагостойкой поверхностью.", "slug": "flexlife-premium-yoga-mat-6mm" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000013',
  'SPRT-WB-013',
  35.00, 50.00, 150,
  array[
    'https://picsum.photos/seed/wb1/800/800',
    'https://picsum.photos/seed/wb2/800/800'
  ],
  'a1000000-0000-0000-0000-000000000004',
  'HydroElite',
  array['bottle', 'water', 'insulated', 'sports'],
  true, true,
  '{
    "en": { "title": "HydroElite Insulated Water Bottle 32oz", "description": "Triple-wall vacuum insulation keeps drinks cold 48hrs or hot 24hrs. BPA-free stainless steel, leak-proof lid, fits most cup holders.", "slug": "hydroelite-insulated-water-bottle-32oz" },
    "uz": { "title": "HydroElite Termos Suv Idishi 32oz", "description": "Uch devorli vakuum izolyatsiya ichimliklarni 48 soat sovuq yoki 24 soat issiq saqlaydi. BPA siz zanglamaydigan po''lat.", "slug": "hydroelite-insulated-water-bottle-32oz" },
    "ru": { "title": "Термос HydroElite 32oz", "description": "Тройная вакуумная изоляция сохраняет напитки холодными 48ч или горячими 24ч. Нержавеющая сталь без BPA.", "slug": "hydroelite-insulated-water-bottle-32oz" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000014',
  'SPRT-RS-014',
  199.00, null, 40,
  array[
    'https://picsum.photos/seed/rs1/800/800',
    'https://picsum.photos/seed/rs2/800/800',
    'https://picsum.photos/seed/rs3/800/800'
  ],
  'a1000000-0000-0000-0000-000000000004',
  'FlexLife',
  array['resistance-bands', 'strength', 'home-gym', 'set'],
  true, false,
  '{
    "en": { "title": "FlexLife Pro Resistance Band Set (5 Levels)", "description": "Complete set of 5 resistance bands from 10-50 lbs. Natural latex, anti-snap design, includes carry bag and exercise guide.", "slug": "flexlife-pro-resistance-band-set" },
    "uz": { "title": "FlexLife Pro Qarshilik Bantlari To''plami (5 Daraja)", "description": "10-50 funtdan 5 ta qarshilik bantining to''liq to''plami. Tabiiy lateks, ko''tarish sumkasi va mashq qo''llanmasi kiritilgan.", "slug": "flexlife-pro-resistance-band-set" },
    "ru": { "title": "Набор эспандеров FlexLife Pro (5 уровней)", "description": "Полный набор из 5 эспандеров от 10 до 50 фунтов. Натуральный латекс, защита от разрыва, сумка и руководство.", "slug": "flexlife-pro-resistance-band-set" }
  }'
),

-- ── Beauty ────────────────────────────────────────────────────────────────────

(
  'b1000000-0000-0000-0000-000000000015',
  'BEAU-SC-015',
  68.00, 90.00, 90,
  array[
    'https://picsum.photos/seed/sc1/800/800',
    'https://picsum.photos/seed/sc2/800/800'
  ],
  'a1000000-0000-0000-0000-000000000005',
  'GlowLab',
  array['serum', 'vitamin-c', 'skincare', 'anti-aging'],
  true, true,
  '{
    "en": { "title": "GlowLab Vitamin C Brightening Serum", "description": "20% stabilized Vitamin C serum with hyaluronic acid and niacinamide. Reduces dark spots, evens skin tone, and boosts collagen. Dermatologist tested.", "slug": "glowlab-vitamin-c-brightening-serum" },
    "uz": { "title": "GlowLab C Vitamini Yorqinlashtiruvchi Zardob", "description": "Gialuron kislotasi va niasinamid bilan 20% barqarorlashtirilgan C vitamini zardob. Qora dog''larni kamaytiradi.", "slug": "glowlab-vitamin-c-brightening-serum" },
    "ru": { "title": "Осветляющая сыворотка GlowLab с витамином C", "description": "Сыворотка с 20% стабилизированным витамином C, гиалуроновой кислотой и ниацинамидом. Уменьшает тёмные пятна.", "slug": "glowlab-vitamin-c-brightening-serum" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000016',
  'BEAU-SP-016',
  42.00, null, 130,
  array[
    'https://picsum.photos/seed/sp1/800/800',
    'https://picsum.photos/seed/sp2/800/800'
  ],
  'a1000000-0000-0000-0000-000000000005',
  'GlowLab',
  array['sunscreen', 'spf50', 'skincare', 'protection'],
  true, false,
  '{
    "en": { "title": "GlowLab Daily Defense SPF 50+ Sunscreen", "description": "Lightweight, non-greasy mineral sunscreen with SPF 50+. Fragrance-free, reef-safe, and suitable for all skin types including sensitive skin.", "slug": "glowlab-daily-defense-spf50-sunscreen" },
    "uz": { "title": "GlowLab Kundalik Himoya SPF 50+ Quyosh Kremi", "description": "SPF 50+ bilan engil, yog''siz mineral quyosh kremi. Hidsiz, rif uchun xavfsiz va sezgir terini o''z ichiga olgan barcha turdagi teri uchun.", "slug": "glowlab-daily-defense-spf50-sunscreen" },
    "ru": { "title": "Солнцезащитный крем GlowLab SPF 50+", "description": "Лёгкий нежирный минеральный солнцезащитный крем SPF 50+. Без отдушек, безопасен для рифов, подходит для всех типов кожи.", "slug": "glowlab-daily-defense-spf50-sunscreen" }
  }'
),

-- ── Books ─────────────────────────────────────────────────────────────────────

(
  'b1000000-0000-0000-0000-000000000017',
  'BOOK-AT-017',
  24.00, null, 300,
  array[
    'https://picsum.photos/seed/bk1/800/800'
  ],
  'a1000000-0000-0000-0000-000000000006',
  'Velora Press',
  array['book', 'atomic-habits', 'self-improvement', 'productivity'],
  true, false,
  '{
    "en": { "title": "Atomic Habits — James Clear", "description": "The life-changing million-copy bestseller. Tiny Changes, Remarkable Results. Learn how to build good habits and break bad ones using science-backed methods.", "slug": "atomic-habits-james-clear" },
    "uz": { "title": "Atom Odatlar — James Clear", "description": "Hayotni o''zgartiradigan million nusxali bestseller. Kichik o''zgarishlar, ajoyib natijalar. Yaxshi odatlarni qanday shakllantirish va yomonlarini sindirishni bilib oling.", "slug": "atomic-habits-james-clear" },
    "ru": { "title": "Атомные привычки — Джеймс Клир", "description": "Бестселлер миллионным тиражом, изменяющий жизнь. Мельчайшие изменения — выдающиеся результаты. Научно обоснованные методы.", "slug": "atomic-habits-james-clear" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000018',
  'BOOK-DP-018',
  28.00, 35.00, 180,
  array[
    'https://picsum.photos/seed/bk2/800/800'
  ],
  'a1000000-0000-0000-0000-000000000006',
  'Velora Press',
  array['book', 'deep-work', 'productivity', 'focus'],
  true, false,
  '{
    "en": { "title": "Deep Work — Cal Newport", "description": "Rules for Focused Success in a Distracted World. The ability to focus without distraction is the superpower of the 21st century.", "slug": "deep-work-cal-newport" },
    "uz": { "title": "Chuqur Ish — Cal Newport", "description": "Chalg''itishlar olamida muvaffaqiyatli bo''lish qoidalari. Chalg''itishsiz diqqat qila olish 21-asrning super kuchi.", "slug": "deep-work-cal-newport" },
    "ru": { "title": "В работу с головой — Кэл Ньюпорт", "description": "Правила сосредоточенного успеха в отвлекающем мире. Умение работать сосредоточенно — суперсила XXI века.", "slug": "deep-work-cal-newport" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000019',
  'ELEC-PB-019',
  399.00, 499.00, 20,
  array[
    'https://picsum.photos/seed/pb1/800/800',
    'https://picsum.photos/seed/pb2/800/800',
    'https://picsum.photos/seed/pb3/800/800'
  ],
  'a1000000-0000-0000-0000-000000000001',
  'TechPulse',
  array['portable-charger', 'power-bank', '20000mah', 'usb-c'],
  true, false,
  '{
    "en": { "title": "TechPulse 20000mAh Portable Charger", "description": "20000mAh power bank with 65W USB-C PD, dual USB-A ports, and LED display. Charges laptops, tablets, and phones simultaneously.", "slug": "techpulse-20000mah-portable-charger" },
    "uz": { "title": "TechPulse 20000mAh Ko''chma Zaryadlovchi", "description": "65W USB-C PD, ikkita USB-A porti va LED displey bilan 20000 mAh quvvat banki. Noutbuklar, planshetlar va telefonlarni bir vaqtda zaryadlaydi.", "slug": "techpulse-20000mah-portable-charger" },
    "ru": { "title": "Портативный зарядник TechPulse 20000mAh", "description": "Внешний аккумулятор 20000 мАч с USB-C PD 65Вт, двумя USB-A и LED-дисплеем. Заряжает ноутбуки, планшеты и телефоны одновременно.", "slug": "techpulse-20000mah-portable-charger" }
  }'
),
(
  'b1000000-0000-0000-0000-000000000020',
  'HOME-PL-020',
  29.00, null, 250,
  array[
    'https://picsum.photos/seed/pl1/800/800',
    'https://picsum.photos/seed/pl2/800/800'
  ],
  'a1000000-0000-0000-0000-000000000003',
  'GreenSpace',
  array['plant', 'succulent', 'decor', 'indoor'],
  true, true,
  '{
    "en": { "title": "Curated Succulent Gift Set (3 Plants)", "description": "Set of 3 hand-picked premium succulents in terracotta pots with pebble decoration. Low maintenance, pet-friendly, and perfect as a gift.", "slug": "curated-succulent-gift-set-3-plants" },
    "uz": { "title": "Tanlangan Sukkulent Sovg''a To''plami (3 O''simlik)", "description": "Shag''al bezagi bilan terrakotta idishlarda qo''lda tanlangan 3 ta premium sukkulent to''plami.", "slug": "curated-succulent-gift-set-3-plants" },
    "ru": { "title": "Набор суккулентов в подарок (3 растения)", "description": "Набор из 3 вручную отобранных суккулентов в терракотовых горшках с декором из гальки. Неприхотливые, безопасны для животных.", "slug": "curated-succulent-gift-set-3-plants" }
  }'
)

on conflict (id) do nothing;

-- ── PRODUCT VARIANTS ─────────────────────────────────────────────────────────

-- Headphones: White / Black / Midnight Blue
insert into public.product_variants (id, product_id, sku, price, stock, attributes) values
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'ELEC-WH-001-WHT', 149.00, 15, '{"color": "White"}'),
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'ELEC-WH-001-BLK', 149.00, 20, '{"color": "Black"}'),
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'ELEC-WH-001-NVY', 159.00, 10, '{"color": "Midnight Blue"}')
on conflict (id) do nothing;

-- Sneakers: sizes 39-44
insert into public.product_variants (id, product_id, sku, price, stock, attributes) values
('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000006', 'FASH-SN-006-39', 129.00, 10, '{"size": "EU 39"}'),
('c1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000006', 'FASH-SN-006-40', 129.00, 18, '{"size": "EU 40"}'),
('c1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000006', 'FASH-SN-006-41', 129.00, 20, '{"size": "EU 41"}'),
('c1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000006', 'FASH-SN-006-42', 129.00, 16, '{"size": "EU 42"}'),
('c1000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000006', 'FASH-SN-006-43', 129.00, 10, '{"size": "EU 43"}'),
('c1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000006', 'FASH-SN-006-44', 129.00,  6, '{"size": "EU 44"}')
on conflict (id) do nothing;

-- T-Shirt: S / M / L / XL in White and Black
insert into public.product_variants (id, product_id, sku, price, stock, attributes) values
('c1000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000007', 'FASH-TS-007-S-WHT',  49.00, 30, '{"size": "S", "color": "White"}'),
('c1000000-0000-0000-0000-000000000021', 'b1000000-0000-0000-0000-000000000007', 'FASH-TS-007-M-WHT',  49.00, 50, '{"size": "M", "color": "White"}'),
('c1000000-0000-0000-0000-000000000022', 'b1000000-0000-0000-0000-000000000007', 'FASH-TS-007-L-WHT',  49.00, 40, '{"size": "L", "color": "White"}'),
('c1000000-0000-0000-0000-000000000023', 'b1000000-0000-0000-0000-000000000007', 'FASH-TS-007-XL-WHT', 49.00, 20, '{"size": "XL", "color": "White"}'),
('c1000000-0000-0000-0000-000000000024', 'b1000000-0000-0000-0000-000000000007', 'FASH-TS-007-S-BLK',  49.00, 30, '{"size": "S", "color": "Black"}'),
('c1000000-0000-0000-0000-000000000025', 'b1000000-0000-0000-0000-000000000007', 'FASH-TS-007-M-BLK',  49.00, 50, '{"size": "M", "color": "Black"}'),
('c1000000-0000-0000-0000-000000000026', 'b1000000-0000-0000-0000-000000000007', 'FASH-TS-007-L-BLK',  49.00, 40, '{"size": "L", "color": "Black"}'),
('c1000000-0000-0000-0000-000000000027', 'b1000000-0000-0000-0000-000000000007', 'FASH-TS-007-XL-BLK', 49.00, 20, '{"size": "XL", "color": "Black"}')
on conflict (id) do nothing;

-- ── COUPONS ───────────────────────────────────────────────────────────────────

insert into public.coupons (id, code, type, value, min_order_amount, max_uses, is_active, expires_at) values
(
  'd1000000-0000-0000-0000-000000000001',
  'WELCOME10',
  'percentage',
  10,
  0,
  1000,
  true,
  now() + interval '1 year'
),
(
  'd1000000-0000-0000-0000-000000000002',
  'SAVE20',
  'percentage',
  20,
  100,
  500,
  true,
  now() + interval '6 months'
),
(
  'd1000000-0000-0000-0000-000000000003',
  'FLAT15',
  'fixed',
  15,
  50,
  null,
  true,
  now() + interval '3 months'
)
on conflict (id) do nothing;
