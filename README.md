# Finserve-Lite: Scalable Fintech API

A robust backend service for managing digital wallets and financial transactions. This project demonstrates high-performance backend architecture using Node.js, focused on security, data integrity, and scalability.

## 🚀 Core Features
* **Secure Authentication:** JWT-based user sessions with hashed passwords (Bcrypt).
* **Double-Entry Ledger:** Ensures data integrity for every transaction between `Accounts`.
* **Redis Caching:** Implementation of caching for frequently accessed account balances to reduce MongoDB load.
* **Rate Limiting:** Protects the API from Brute Force and DDoS attacks using `express-rate-limit`.
* **ACID Compliance:** Uses Mongoose Transactions to ensure money is never "lost" during a transfer.

## 🛠 Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **Caching:** Redis
* **Authentication:** JSON Web Tokens (JWT)

## 📁 Project Structure
```text
/Finserve-lite
├── /backend
│   ├── /config         # Database and Redis configurations
│   ├── /controllers    # Logic for Users, Accounts, Transactions
│   ├── /middleware     # Auth, Rate-limiting, Error handling
│   ├── /models         # Mongoose Schemas (User, Account, Transaction)
│   ├── /routes         # API Endpoints
│   └── server.js       # Entry point
└── /frontend           # React (Minimal UI for transaction history)
