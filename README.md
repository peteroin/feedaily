<div align="center">
    <picture>
      <img alt="feedaily logo" src="resources/feedaily.svg" width="100">
    </picture>
  </a>
  <h1>Feedaily</h1>
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)   [![GitHub issues](https://img.shields.io/github/issues/peteroin/feedaily)](https://github.com/peteroin/feedaily/issues)   [![GitHub stars](https://img.shields.io/github/stars/peteroin/feedaily)](https://github.com/peteroin/feedaily/stargazers)
</div>

## Table of Contents

- [About](#about)  
- [Features](#features)  
- [Architecture / Tech Stack](#architecture--tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Running Locally](#running-locally)  
- [Usage](#usage)  
- [Contributing](#contributing)  
- [Issue Labels](#issue-labels)  
- [License](#license)  
- [Contact / Contributors](#contact--contributors)  

---

## About

Feedaily is a platform aimed at reducing food waste by connecting those who have excess food with those in need. It empowers communities to share, donate, or redistribute surplus food, helping to fight hunger and promote sustainability.

<div align="center">
    <picture>
      <img alt="feedaily logo" src="resources/DiagramFeedaily.jpg" width="850">
    </picture>
  </a>
</div>


## Features

- User authentication / profiles  
- Create listings of surplus food  
- Browse nearby food offers  
- Claim / reserve food  
- Image classification to validate food (if applicable)  
- Notifications / status tracking  
- Admin moderation  
- Email Servide Integration
- Whatsapp Bot Integration
- Payment Gateway Integration (Stripe)
- Live Location 

## Tech Stack

- **Frontend**: Vite + React + Tailwind CSS  
- **Backend**: Node.js / Express (or your backend framework)  
- **Database**: SQLite (or whichever DB you use)  
- **Other Tools / Libraries**:  
  - Image classification model / CNN  
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
# Default: http://localhost:5173
```

Run **backend**:

```bash
cd backend
node server.js
# Default: http://localhost:5000
```

The frontend should now communicate with the backend API.


## Usage

1. Sign up / log in  
2. Create a new food listing (name, description, image, quantity, etc.)  
3. Browse available food listings nearby  
4. Claim or reserve a listing  
5. Track status, notifications, or updates  

### Possible Extensions
- Search / filtering  
- Ratings & feedback  
- Map integration for location-based matching
  
## 🤝 Contributing

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


## 🏷️ Issue Labels

We use labels to organize issues:

| Label              | Meaning                          |
|--------------------|----------------------------------|
| `good first issue` | Beginner-friendly issues         |
| `help wanted`      | Issues where we’d love extra help |
| `bug`              | Something isn’t working          |
| `enhancement`      | New feature requests             |
| `documentation`    | Fixes or improvements to docs    |
| `question`         | Questions or clarifications      |

## Contact / Contributors

- **Maintainer / Owner**: [Peter](https://github.com/peteroin) , [Victor](https://github.com/ictorv) 
- Contributors: **you!**  

Have ideas or want to help? Open an **issue** or a **PR**.  

---

> ✨ “Connecting people to save food, fight hunger, and reduce waste.”  

---

✌️ Thank you for checking out **Feedaily** - together we can make an impact!  