# CardShoop – Telegram Mini App Shop

System sklepu internetowego dzialajacy wewnatrz Telegrama z obsluga platnosci Stars i kryptowalut.

## Architektura

```
Telegram Client
    |
    | HTTPS
    v
Express.js Server (port 3000)
    |-- POST /webhook           <- Telegram Bot updates
    |-- POST /crypto-webhook    <- CryptoBot webhook
    |-- GET  /api/products      <- Lista produktow
    |-- POST /api/invoices/stars
    |-- POST /api/invoices/crypto
    |-- GET  /app/*             <- React Mini App (Vite build)
    |
    |-- SQLite DB (cardshoop.db)
    |-- Telegraf Bot
    `-- Powiadomienia do grupy adminow
```

---

## Krok 1: Konfiguracja BotFather

1. Otworz Telegrama i napisz do @BotFather
2. Wpisz /newbot, podaj nazwe i username bota
3. Skopiuj token bota (bedzie potrzebny w .env)
4. Wpisz /newapp (lub /mybots -> wybierz bota -> Bot Menu Button -> Edit Menu Button)
5. Jako URL Mini App podaj: https://twojadomena.pl/app
6. Zapisz URL Mini App

**Wazne:** Bot musi miec wlaczone platnosci.
W @BotFather: /mybots -> wybierz bota -> Payments -> podlacz Telegram Stars (XTR) jako provider.

---

## Krok 2: Konfiguracja CryptoBot

1. Otworz @CryptoBot na Telegramie
2. Wybierz: Bots -> Create App
3. Podaj nazwe i URL webhooka: https://twojadomena.pl/crypto-webhook
4. Skopiuj token API (CRYPTOBOT_TOKEN)
5. Skopiuj sekret webhooka (CRYPTOBOT_WEBHOOK_SECRET)
6. Na potrzeby testow uzyj @CryptoTestnetBot zamiast @CryptoBot

---

## Krok 3: Tworzenie prywatnej grupy adminow

1. Stworz nowa grupe prywatna na Telegramie (np. "CardShoop Admins")
2. Dodaj swojego bota do grupy
3. Nadaj botowi uprawnienia administratora (co najmniej: Send Messages)
4. Jak zdobyc ID grupy:
   - Dodaj @userinfobot do grupy
   - Wpisz cokolwiek w grupie
   - @userinfobot odpowie z ID grupy (format: -100xxxxxxxxx)
5. Wpisz ID grupy do .env jako ADMIN_GROUP_ID
6. Usun @userinfobot z grupy

---

## Krok 4: Konfiguracja serwera

### Wymagania
- Node.js v18+
- VPS z publicznym IP i domena z SSL (lub ngrok do testow)

### Instalacja

```bash
# Klonowanie / przejscie do katalogu
cd /home/tuptus/cardshoop

# Backend
cd backend
npm install

# Skopiuj i uzupelnij .env
cp .env.example .env
nano .env

# Wygeneruj ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Skopiuj wynik do ENCRYPTION_KEY w .env

# Wypełnij baze przykladowymi produktami
npm run seed
```

### Dodawanie prawdziwych kont

Po uruchomieniu seeda, dodaj prawdziwe dane kont do bazy:

```js
// Uruchom ten skrypt jednorazowo: node add_account.js
require('dotenv').config();
const { db, helpers } = require('./backend/src/db/database');

const productId = 1; // ID produktu
const credentials = JSON.stringify({
  email: 'klient@example.com',
  password: 'TwojePrawdziwHaslo123',
  note: 'NIE ZMIENIAJ HASLA',
});

db.prepare('INSERT INTO accounts (product_id, credentials_encrypted) VALUES (?, ?)')
  .run(productId, helpers.encrypt(credentials));

console.log('Konto dodane!');
```

### Frontend

```bash
cd /home/tuptus/cardshoop/frontend
npm install
npm run build
# Pliki statyczne beda w frontend/dist/
```

---

## Krok 5: Uruchomienie (Produkcja z PM2)

```bash
# Zainstaluj PM2
npm install -g pm2

# Uruchom backend
cd /home/tuptus/cardshoop/backend
pm2 start src/server.js --name cardshoop-backend

# Zapisz konfiguracje PM2
pm2 save
pm2 startup
```

---

## Krok 6: Konfiguracja nginx (HTTPS)

```nginx
# /etc/nginx/sites-available/cardshoop
server {
    listen 80;
    server_name twojadomena.pl;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name twojadomena.pl;

    ssl_certificate /etc/letsencrypt/live/twojadomena.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/twojadomena.pl/privkey.pem;

    # Proxy do Node.js
    location /webhook {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /crypto-webhook {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        add_header Access-Control-Allow-Origin *;
    }

    # Mini App (statyczne pliki Vite)
    location /app {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Domyslnie blokuj reszte
    location / {
        return 404;
    }
}
```

```bash
# SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d twojadomena.pl

# Aktywuj konfiguracje
sudo ln -s /etc/nginx/sites-available/cardshoop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Krok 7: Testy lokalne z ngrok

Jesli nie masz VPS, mozesz testowac lokalnie:

```bash
# Zainstaluj ngrok: https://ngrok.com
ngrok http 3000

# Skopiuj HTTPS URL (np. https://xxxx.ngrok.io) do .env jako WEBHOOK_URL
# Zmien NODE_ENV=development w .env
# Uruchom backend: npm run dev
```

---

## Struktura bazy danych

### Tabela: products
| Kolumna | Typ | Opis |
|---|---|---|
| id | INTEGER | Klucz glowny |
| name | TEXT | Nazwa produktu |
| category | TEXT | Kategoria (Spotify, Netflix...) |
| description | TEXT | Opis |
| price_stars | INTEGER | Cena w Stars |
| price_usdt | REAL | Cena w USDT |
| image_emoji | TEXT | Emoji ikony |
| is_active | INTEGER | 1 = aktywny |

### Tabela: accounts
| Kolumna | Typ | Opis |
|---|---|---|
| id | INTEGER | Klucz glowny |
| product_id | INTEGER | FK do products |
| credentials_encrypted | TEXT | Zaszyfrowane AES-256 dane |
| is_sold | INTEGER | 0 = dostepne, 1 = sprzedane |
| sold_to_user_id | TEXT | Telegram user ID |
| sold_at | TEXT | Data sprzedazy |

### Tabela: orders
| Kolumna | Typ | Opis |
|---|---|---|
| id | INTEGER | Klucz glowny |
| user_id | TEXT | Telegram user ID |
| username | TEXT | @username |
| product_id | INTEGER | FK do products |
| payment_method | TEXT | stars / crypto |
| amount | REAL | Kwota |
| currency | TEXT | XTR / USDT / TON |
| status | TEXT | pending/paid/fulfilled/failed |
| cryptobot_invoice_id | INTEGER | ID faktury CryptoBot |

---

## Przeplyw platnosci

### Stars
```
Mini App -> POST /api/invoices/stars
         <- { invoice_link }
Mini App -> WebApp.openInvoice(invoice_link)
Telegram -> pre_checkout_query -> Bot odpowiada OK
Telegram -> successful_payment -> Bot fulfilluje zamowienie
                               -> Wysyla dane do kupujacego
                               -> Powiadamia grupe adminow
```

### Kryptowaluta
```
Mini App -> POST /api/invoices/crypto
         <- { pay_url, order_id }
Mini App -> WebApp.openLink(pay_url)
Uzytkownik placi w @CryptoBot
CryptoBot -> POST /crypto-webhook
Backend -> Weryfikuje sygnature
        -> Fulfilluje zamowienie
        -> Wysyla dane do kupujacego
        -> Powiadamia grupe adminow
```

---

## Bezpieczenstwo

- Hasla kont szyfrowane AES-256-GCM
- Klucz szyfrowania TYLKO w .env (nigdy w kodzie)
- initData Telegrama weryfikowane HMAC-SHA256
- Webhook Telegrama chroniony sekretnym tokenem
- Webhook CryptoBot weryfikowany sygnatura HMAC
- .env NIE powinno byc w repozytorium git (dodaj do .gitignore)

## .gitignore

Utwórz plik /home/tuptus/cardshoop/.gitignore:

```
node_modules/
.env
*.db
frontend/dist/
*.log
```
# cardshoop
