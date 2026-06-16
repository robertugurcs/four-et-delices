# Meta ve Production — Yapılacaklar Listesi

Kod hazır. Aşağıdaki adımları sırayla uygula.

## Akış

1. Meta WhatsApp template’leri (EN + FR, **9 param**) → onay bekle
2. Test token + local form testi
3. Resend domain (production e-posta)
4. Khoudia +221 numarası + kalıcı token
5. Vercel env + deploy

---

## BÖLÜM 1 — Meta WhatsApp Template’leri

### 1.1 WhatsApp Manager

1. [WhatsApp Manager](https://business.facebook.com/wa/manage/home/) → **Account tools** → **Message templates**
   - Direkt: [Message templates](https://business.facebook.com/wa/manage/message-templates/)
2. Doğru WhatsApp Business Account seçili olsun.

### 1.2 İngilizce — `customer_cake_confirmation` (güncelle)

| Alan | Değer |
|------|--------|
| Name | `customer_cake_confirmation` |
| Category | Utility |
| Language | English |

Body — `src/lib/whatsapp-customer-template.ts` → `META_CUSTOMER_TEMPLATE_BODIES.en` dosyadan kopyala (9 param, Cake Designer Khoudia tonu, {{8}} notes, {{9}} delivery).

### 1.3 Fransızca — `customer_cake_confirmation_fr` (yeni)

| Alan | Değer |
|------|--------|
| Name | `customer_cake_confirmation_fr` |
| Category | Utility |
| Language | French |

Body — `META_CUSTOMER_TEMPLATE_BODIES.fr` dosyadan kopyala.

**Submit for review.**

### 1.4 Parametre sırası (kod ile birebir)

| # | Değer |
|---|--------|
| {{1}} | First name |
| {{2}} | Order ID (`CAKE-04217`, 5 digits) |
| {{3}} | Occasion |
| {{4}} | Servings |
| {{5}} | Flavour |
| {{6}} | Style |
| {{7}} | Event date |
| {{8}} | Notes (form textarea) |
| {{9}} | Delivery or Pickup |

Onay gelene kadar eski template ile WhatsApp fail edebilir — normal.

---

## BÖLÜM 2 — Meta Test (local)

### 2.1 Developer Console

1. [Meta for Developers — Apps](https://developers.facebook.com/apps/)
2. **Cake Website Test** → **WhatsApp** → **API Setup**
3. Kopyala:
   - Temporary access token → `WHATSAPP_ACCESS_TOKEN`
   - Phone number ID → `WHATSAPP_PHONE_NUMBER_ID`

Token ~24 saat geçerli. 401 alırsan yenile.

Dokümantasyon: [WhatsApp Cloud API — Get Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

### 2.2 Test alıcı numarası

API Setup → **To** → `+90 553 423 95 70` ekle ve doğrula.

### 2.3 `.env.local` (test)

```env
RESEND_API_KEY=re_...
RESEND_FROM=Four et Délices <onboarding@resend.dev>
OWNER_EMAIL=robertugurcs@gmail.com
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
```

Env kontrolü: `npm run check:order-env`

### 2.3.1 E-posta rolleri (kim ne alır?)

Mailler **Gmail SMTP ile değil**, **Resend** üzerinden gider. Gmail adresleri sadece **alıcı inbox**’tur.

| Rol | Nerede tanımlı | Ne alır |
|-----|----------------|---------|
| **Gönderen (From)** | `RESEND_FROM` | `Four et Délices <onboarding@resend.dev>` (test) veya `orders@domain.com` (prod) |
| **Restoran / owner** | `OWNER_EMAIL` | Yeni sipariş bildirimi — test: `robertugurcs@gmail.com` |
| **Müşteri** | Form **Email** alanı | Onay maili — herhangi bir adres (ör. `mariannendoye12@gmail.com`) |

Kod iki mail atar: owner’a bildirim + müşteriye Khoudia tonunda onay (`src/lib/inquiry-notification-copy.ts`). WhatsApp ayrı kanal.

### 2.3.2 Sandbox vs domain (kime mail gider?)

| `RESEND_FROM` | Müşteri form email | Sonuç |
|---------------|-------------------|--------|
| `onboarding@resend.dev` | Resend hesabınla aynı (ör. `robertugurcs@gmail.com`) | **Senaryo A** — 2 mail + WhatsApp çalışır |
| `onboarding@resend.dev` | Farklı adres (ör. `mariannendoye12@gmail.com`) | Müşteri maili **gelmez** (Resend sandbox kısıtı) |
| Doğrulanmış domain (`orders@yourdomain.com`) | Herhangi bir adres | **Senaryo B** — gerçekçi test |

Site yayınlanmadan da Resend domain DNS doğrulanabilir — site domain’i ile e-posta domain’i aynı olabilir ama farklı işlevlerdir.

### 2.4 Senaryo A — Hızlı test (domain yok)

1. `.env.local`: `cake-site` Resend key + yukarıdaki env
2. Form **Email**: `robertugurcs@gmail.com` (Resend hesabınla aynı)
3. Form **Phone**: `+90 553 423 95 70`
4. Beklenen: Robert inbox’ta **2 mail** (konu: “New Cake Inquiry” + “Your inquiry with Four et Délices”) + WhatsApp

Manuel API: `npm run test:order-api` (payload: `scripts/order/test-payload.json`)

### 2.5 Senaryo B — Gerçekçi müşteri testi (domain gerekli)

1. [Resend Domains](https://resend.com/domains) → domain ekle → DNS TXT/MX doğrula
2. `.env.local`: `RESEND_FROM=Four et Délices <orders@yourdomain.com>`
3. Form **Email**: `mariannendoye12@gmail.com` (veya herhangi bir adres)
4. `OWNER_EMAIL=robertugurcs@gmail.com` kalır
5. Beklenen:
   - `robertugurcs@gmail.com` → owner bildirimi
   - `mariannendoye12@gmail.com` → müşteri onay maili
   - WhatsApp → form telefonu

### 2.6 Form testi (genel)

1. `npm run dev`
2. `/en/inquiry` veya `/fr/inquiry`
3. Notes alanına metin yaz
4. Telefon: `+90 553 423 95 70`
5. Beklenen: 2 e-posta + 1 WhatsApp (notes + delivery dahil)

---

## BÖLÜM 3 — Resend (production e-posta)

1. [Resend — Domains](https://resend.com/domains) → domain ekle, DNS doğrula
2. [Resend — API Keys](https://resend.com/api-keys)

Production env:

```env
RESEND_API_KEY=re_...
OWNER_EMAIL=fouretdelices@gmail.com
RESEND_FROM=Four et Délices <orders@yourdomain.com>
```

---

## BÖLÜM 4 — Meta Production (Khoudia)

Numara: **+221 77 728 9602**

1. [Meta Business Settings](https://business.facebook.com/settings) → numara bağla
   - Rehber: [Add a phone number](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/add-phone-number)
2. [System users](https://business.facebook.com/settings/system-users) → kalıcı token
   - İzin: `whatsapp_business_messaging`
   - Rehber: [System User tokens](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#system-user-access-tokens)
3. API Setup’tan Khoudia numarasının **Phone number ID**’sini al

---

## BÖLÜM 5 — Vercel

1. GitHub repo’yu Vercel’e bağla
2. [Environment Variables](https://vercel.com/docs/projects/environment-variables)

| Değişken | Production değer |
|----------|------------------|
| `RESEND_API_KEY` | Resend key |
| `OWNER_EMAIL` | `fouretdelices@gmail.com` |
| `RESEND_FROM` | `Four et Délices <orders@domain>` |
| `WHATSAPP_ACCESS_TOKEN` | System User token |
| `WHATSAPP_PHONE_NUMBER_ID` | Khoudia numara ID |

3. Deploy → canlı siteden form test et

---

## Kontrol listesi

- [ ] `customer_cake_confirmation` (EN) — Approved, 9 param
- [ ] `customer_cake_confirmation_fr` (FR) — Approved, 9 param
- [ ] Local test: notes → customer mail + WhatsApp
- [ ] Resend domain verified
- [ ] Khoudia +221 Meta’da
- [ ] Kalıcı token + Phone ID Vercel’de
- [ ] Production form testi
