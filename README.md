# Reservation Processor API 🚀

Aplikacja backendowa do przetwarzania plików rezerwacji w formacie **XLSX** z wykorzystaniem **NestJS, MongoDB, BullMQ (Redis) i WebSocket**.

## 🛠 Technologie

- **NestJS** – modularna struktura
- **MongoDB + Mongoose** – przechowywanie rezerwacji i zadań
- **BullMQ + Redis** – obsługa kolejek asynchronicznych
- **Socket.IO (WebSocket)** – śledzenie statusu w czasie rzeczywistym
- **Swagger (OpenAPI)** – dokumentacja API

---

## Instalacja i uruchomienie

- aplikację uruchamiać poprzez: docker-compose up --build -d
- dokumentacja API: http://localhost:3000/api#
- przykładowy .env:
  MONGO_URI=mongodb://localhost:27017/reservations
  REDIS_HOST=localhost
  REDIS_PORT=6379
  API_KEY=super-tajne-haslo
  BATCH_SIZE=100

## Potencialne usprawnienia w przyszłości

- **Obsługa dużych plików** – zaimplementowanie podziału na sesje w Mongo (wymaga replikacji w bazie).
- **Dodanie loggerów w całym projekcie**
- **Uzupełnienie testów**
- **Ujednolicenie językowe**U – w zależności od wymagań biznesowych zmiana wszystkich komunikatów na angielski, a tłumaczenia na język polski w formie pliku konfiguracyjnego lub innego zewnętrznego źródła danych.
- **Dodać formatowanie do raportu**
