<div align="center">
  <img alt="Feedaily Logo" src="assets/feedaily.svg" width="120">
  <h1>Feedaily</h1>
  <p>Connecting people to save food, fight hunger, and reduce waste.</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) 
  [![GitHub issues](https://img.shields.io/github/issues/peteroin/feedaily)](https://github.com/peteroin/feedaily/issues)  
  [![GitHub stars](https://img.shields.io/github/stars/peteroin/feedaily)](https://github.com/peteroin/feedaily/stargazers)
</div>

## Table of Contents

- [About](#about)  
- [Demo](#demo)  
- [Features](#features)  
- [Architecture / Tech Stack](#architecture--tech-stack)  
- [Getting Started](#getting-started)  
- [Usage](#usage)  
- [Contributing](#contributing)  
- [Issue Labels](#issue-labels)  
- [License](#license)  
- [Contact / Contributors](#contact--contributors)  

## About

Feedaily is a platform aimed at reducing food waste by connecting those who have excess food with those in need. It empowers communities to share, donate, or redistribute surplus food, helping to fight hunger and promote sustainability.

## Demo

<div align="center">
    <picture>
      <img alt="feedaily logo" src="assets/DiagramFeedaily.jpg" width="850">
    </picture>
</div>

## Features

- User authentication & profiles  
- Create listings of surplus food  
- Browse nearby food offers  
- Claim / reserve food  
- Image classification to validate food  
- Notifications / status tracking  
- Admin moderation  
- Email Service Integration  
- WhatsApp Bot Integration  
- Payment Gateway Integration (Stripe)  
- Live location tracking

## Architecture / Tech Stack

- **Frontend**: Vite + React + Tailwind CSS  
- **Backend**: Node.js / Express  
- **Database**: SQLite (or your choice)  
- **Other Tools / Libraries**:  
  - CNN / Image classification model  
  - API routing, file uploads, etc.

## Getting Started

### Prerequisites

- Node.js (v16 or newer)  
- npm or yarn  
- SQLite (optional if using file-based DB)  

### Installation

Clone the repository:

```bash
git clone https://github.com/peteroin/feedaily.git
cd feedaily
```

Install dependencies:

```bash
# frontend
cd frontend
npm install

# backend
cd ../backend
npm install
```

### Running Locally

Run **frontend**:

```bash
cd frontend
npm run dev
# Open http://localhost:5173
```

Run **backend**:

```bash
cd backend
node server.js
# API runs on http://localhost:5000
```

The frontend should now communicate with the backend API.

## Usage

1. Sign up / log in  
2. Create a new food listing (name, description, image, quantity, etc.)  
3. Browse available food listings nearby  
4. Claim or reserve a listing  
5. Track status, notifications, or updates  

## Possible Extensions
- Search / filtering  
- Ratings & feedback  
- Map integration for location-based matching
  
## Contributing

We welcome contributions! 🙌 Whether it’s fixing bugs, adding features, improving docs, or writing tests - all help is appreciated.

Steps to contribute:

1. **Fork** the repo  
2. Create a feature branch  
```bash
git checkout -b feature/my-feature
```
3. Make your changes  
4. Commit & push  
5. Open a **Pull Request**  

Check [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Issue Labels

We use labels to organize issues:

| Label              | Meaning                           |
| ------------------ | --------------------------------- |
| `good first issue` | Beginner-friendly issues          |
| `help wanted`      | Issues where extra help is needed |
| `bug`              | Something isn’t working           |
| `enhancement`      | New feature requests              |
| `documentation`    | Documentation improvements        |
| `question`         | Questions or clarifications       |

## Contact / Contributors

- **Maintainer / Owner**: [Peter](https://github.com/peteroin) , [Victor](https://github.com/ictorv) 
- Contributors: **you!** 

Open an **issue** or **PR** if you have ideas or want to help.

## Mission

----------------------------------------------------
“Connecting people to save food, fight hunger, and reduce waste.”  
----------------------------------------------------

✌️ Thank you for checking out **Feedaily** - together we can make an impact! 🚀