<div align="center">
  <img alt="Feedaily Logo" src="assets/feedaily.svg" width="120">
  <h1>feedaily</h1>
  <p><em>Connecting people to save food, fight hunger, and reduce waste.</em></p>
  
[![License](https://img.shields.io/badge/License-MIT-8BC34A.svg)](LICENSE)
[![Issues](https://img.shields.io/github/issues/peteroin/feedaily?color=FF7043)](https://github.com/peteroin/feedaily/issues)
[![Stars](https://img.shields.io/github/stars/peteroin/feedaily?style=flat&color=FFD54F)](https://github.com/peteroin/feedaily/stargazers)
[![Forks](https://img.shields.io/github/forks/peteroin/feedaily?color=4DD0E1)](https://github.com/peteroin/feedaily/network/members)
[![Contributors](https://img.shields.io/github/contributors/peteroin/feedaily?color=BA68C8)](https://github.com/peteroin/feedaily/graphs/contributors)

</div>

## Table of Contents

- [About](#about)  
- [Demo](#flow-diagram)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Running Locally](#running-locally) 
- [Usage](#usage)  
- [Contributing](#contributing)  
- [Issue Labels](#issue-labels)  
- [License](#license)  
- [Contact](#contact)  
- [Contributors](#contributors)  

## About

Feedaily is a platform aimed at reducing food waste by connecting those who have excess food with those in need. It empowers communities to share, donate, or redistribute surplus food, helping to fight hunger and promote sustainability.

## Flow Diagram

<div align="center">
    <picture>
      <img alt="feedaily logo" src="assets/DiagramFeedaily.jpg" width="850">
    </picture>
</div>

## Features

- User Authentication & Profiles  
- Create listings of Surplus Food  
- Browse nearby Food Offers  
- Claim / Reserve food  
- Image classification to Validate Food  
- Notifications / Status tracking  
- Admin Moderation  
- Email Service Integration  
- WhatsApp Bot Integration  
- Payment Gateway Integration (Stripe)  
- Live location tracking

## Tech Stack

```text
┌─────────────────────────────────────────────────────────────────┐
│                        FULL STACK ARCHITECTURE                  │
├─────────────────┬─────────────────┬─────────────────────────────┤
│    FRONTEND     │     BACKEND     │        AI/ML COMPONENTS     │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ • React         │ • Express.js    │ • CNN Image Classification  │
│ • Vite          │ • Node.js       │ • TensorFlow Models         │
│ • Tailwind CSS  │ • SQLite        │ • File Processing           │
│ • GSAP Animations│ • REST APIs    │ • Image Recognition         │
│ • React Router  │ • File Uploads  │                             │
│ • Google Charts │ • Authentication│        INTEGRATIONS         │
│ • jsPDF Export  │ • bcrypt        ├─────────────────────────────┤
│ • React Webcam  │ • Sessions      │ • WhatsApp API              │
│                 │ • Nodemailer    │ • Twilio SMS                │
│                 │                 │ • Stripe Payments           │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

</p>

## Getting Started


### Prerequisites
Before you get started, ensure you have the following installed:
- **Node.js** (v16 or newer)  
- **npm** or **yarn**  
- **SQLite** (optional if using file-based database)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/peteroin/feedaily.git
cd feedaily
```

2. Install dependencies:

```bash
# frontend
cd frontend
npm install

# backend
cd ../backend
npm install
```

### Running Locally

3. Run **frontend**:

```bash
cd frontend
npm run dev
# default: http://localhost:5173
```

4. Run **backend**:

```bash
cd backend
node server.js
# API runs on: http://localhost:5000
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

We welcome contributions! 🙌 Whether it’s fixing bugs, adding features, improving docs, or writing tests all help is appreciated.

Steps to contribute:

1. **Fork** the repo  
2. Create a branch  
```bash
git checkout -b feature/my-feature
```
3. Make your changes  
4. Commit & push  
5. Open a **Pull Request**  

> Note: We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for all commit messages.    
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

## Contact  
<p align="center">
  <strong>Maintainers</strong>  
  <br>
  <a href="https://github.com/peteroin">Peter</a> • <a href="https://github.com/ictorv">Victor</a>
</p>


## Contributors
<p align="center">
<a href="https://github.com/peteroin/feedaily/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=peteroin/feedaily" />
</a>
</p> 

<p align="center">
Open an <a href="https://github.com/peteroin/feedaily/issues"><strong>issue</strong></a> or a <strong>PR</strong> if you have ideas or want to help.  
</p>



<p align="center">
<strong><em>Connecting people to save food, fight hunger, and reduce waste.</em></strong>  
</p>

<p align="center">
💚 Thank you for checking out <strong>feedaily</strong> - together we can make an impact!
</p>
