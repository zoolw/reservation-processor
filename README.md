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

## Potencialne usprawnienia w przyszłości

- **Obsługa dużych plików** – zaimplementowanie podziału na sesje w Mongo (wymaga replikacji w bazie).
- **Dodanie loggerów w całym projekcie**
- **Uzupełnienie testów**
- **Ujednolicenie językowe**U – w zależności od wymagań biznesowych zmiana wszystkich komunikatów na angielski, a tłumaczenia na język polski w formie pliku konfiguracyjnego lub innego zewnętrznego źródła danych.
- **Dodać formatowanie do raportu**
