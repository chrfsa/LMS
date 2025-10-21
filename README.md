# Vibeenengineer LMS (Learning Management System)

## 🎯 Objectif

Mini-parcours éducatif en 3 modules avec:
- Authentification mock (email + password)
- Sauvegarde de progression en PostgreSQL
- Vidéos YouTube intégrées
- Quiz QCM de validation
- Logique de gating (déverrouillage progressif)
- Certification finale

## 🏗️ Architecture

### Monorepo
```
LMS/
├── api/          # Backend Express + TypeScript + Prisma
├── web/          # Frontend Vite + React + TypeScript + Tailwind
└── docker-compose.yml
```

### Services Docker
- **db**: PostgreSQL 16 (port 5433)
- **api**: Node 20 + Express + Prisma (port 4000)
- **web**: Node 20 + Vite (port 5173)

Tous les services ont hot reload en développement.

## 🛠️ Stack Technique

### Backend (api/)
- **Runtime**: Node.js 20
- **Framework**: Express
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 16
- **Auth**: JWT (HS256, 7 jours)
- **Validation**: Zod
- **Password**: bcryptjs (hash avec 10 rounds)

### Frontend (web/)
- **Bundler**: Vite
- **Framework**: React 18
- **Language**: TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS (thème dark "futur vibes")
- **HTTP**: Axios
- **Validation**: Zod

## 🚀 Quickstart

### 1. Prérequis
- Docker & Docker Compose
- Git

### 2. Démarrage
```bash
# Cloner le projet
cd /home/said/Bureau/LMS

# Copier les fichiers .env (déjà configurés)
# api/.env et web/.env sont déjà présents

# Lancer tous les services
docker compose up -d --build

# Vérifier les logs
docker compose logs -f
```

### 3. Accès
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000/health
- **Database**: postgres://app:app@localhost:5433/vibeen

## 📋 Fonctionnalités

### Authentification
- **Register**: `POST /auth/register` → Crée utilisateur + init progression (3 modules)
- **Login**: `POST /auth/login` → Retourne JWT
- **Me**: `GET /auth/me` → Profil utilisateur (auth required)

**Validation**:
- Email: format valide (regex simple)
- Password: minimum 5 caractères

### Progression
- **Get Progress**: `GET /progress` → Liste modules + unlocked flags
- **Reset**: `POST /progress/reset` → Réinitialise la progression

**Règles de gating**:
- Module 1: toujours débloqué
- Module 2: débloqué si Module 1 validé
- Module 3: débloqué si Module 2 validé

### Quiz
- **Get Quiz**: `GET /quiz/:moduleId` → Questions (sans réponses)
- **Submit**: `POST /quiz/:moduleId/submit` → body `{ answers: [0,1,2] }`

**Validation**:
- 3 questions par module
- Score 3/3 requis pour validation
- Réponses stockées côté serveur uniquement

## 🎓 Parcours

### Module 1 — Foundations of Vibeenengineering
- Vidéo: dQw4w9WgXcQ
- Quiz: Signal, État Done, Métrique progression

### Module 2 — Systems & Signals
- Vidéo: 9bZkp7q19f0
- Quiz: Sous-tâches, Source de vérité, Logging

### Module 3 — Applied Flows
- Vidéo: 3GwjfUFyY6M
- Quiz: Validation finale, Gating, Responsabilité API

### Écran Final
Après validation du Module 3:
- Message: "Bravo, tu es maintenant Vibenengineer Certified !"
- Actions: Retour Dashboard, Recommencer (reset)

## 📊 Base de données

### Schema Prisma
```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String    // bcrypt hash
  progress  Progress[]
}

model Progress {
  id        Int      @id @default(autoincrement())
  userId    Int
  moduleId  Int      // 1, 2, 3
  status    ProgressStatus  // in_progress | done
  validated Boolean  @default(false)
  quizScore Int?
  @@unique([userId, moduleId])
}
```

## 🔒 Sécurité

- Passwords hashés avec bcryptjs (10 rounds)
- JWT signé (secret: `JWT_SECRET` env var)
- Token stocké en localStorage (memory state + persist)
- Authorization header: `Bearer <token>`
- Gating côté serveur (403 si module non débloqué)
- Validation Zod sur backend + frontend

## 📝 Logs

### Frontend
Tags: `[AUTH]`, `[PROGRESS]`, `[QUIZ]`, `[NAV]`

### Backend
Tags: `[AUTH]`, `[PROGRESS]`, `[QUIZ]`, `[DB]`

Tous les logs dans `console.log` pour traçabilité.

## 🐳 Docker

### Environnement
- **DATABASE_URL**: `postgres://app:app@db:5432/vibeen`
- **JWT_SECRET**: `change-me` (défaut, à changer en prod)
- **VITE_API_URL**: `http://localhost:4000`

### Volumes
- `db_data`: Persistance PostgreSQL
- `./api:/app` + `/app/node_modules`: Hot reload API
- `./web:/app` + `/app/node_modules`: Hot reload Web

### Healthchecks
- **db**: `pg_isready -U app -d vibeen`
- **api**: `GET /health`

## 📦 Scripts

### API (api/)
```bash
npm run dev              # Dev avec tsx watch
npm run build            # Compile TS → JS
npm run start            # Démarre dist/index.js
npm run prisma:generate  # Génère Prisma client
npm run prisma:migrate   # Applique migrations
npm run prisma:studio    # UI Prisma
```

### Web (web/)
```bash
npm run dev     # Dev avec Vite
npm run build   # Build production
npm run preview # Preview build
```

## 🧪 Tests Manuels

### 1. Auth Flow
```bash
# Register
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"12345"}'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"12345"}'

# Me (avec token)
curl http://localhost:4000/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

### 2. Progress
```bash
# Get progress
curl http://localhost:4000/progress \
  -H "Authorization: Bearer <TOKEN>"

# Reset
curl -X POST http://localhost:4000/progress/reset \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. Quiz
```bash
# Get quiz
curl http://localhost:4000/quiz/1 \
  -H "Authorization: Bearer <TOKEN>"

# Submit (correct answers: all index 1)
curl -X POST http://localhost:4000/quiz/1/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"answers":[1,1,1]}'
```

## 🎨 Design

Thème **dark futuristic** avec:
- Background: `#0a0e1a`
- Accent: `#00d9ff` (cyan)
- Purple: `#a855f7`
- Cards: `#1a1f2e`

Composants accessibles, responsive, transitions fluides.

## 📈 Flow de Progression

1. **Connexion/Inscription** → Dashboard
2. **Dashboard** → 3 cards (Module 1 unlocked)
3. **Module 1** → Vidéo + Quiz → Validation → Module 2 unlocked
4. **Module 2** → Vidéo + Quiz → Validation → Module 3 unlocked
5. **Module 3** → Vidéo + Quiz → Validation → Écran Final
6. **Final** → Certification + Reset option

## 🔧 Choix Techniques

- **Monorepo simple** (pas Turborepo/Lerna pour rester minimal)
- **Prisma** pour type-safety DB
- **JWT** en memory + localStorage (pas de cookies pour simplicité)
- **Tailwind** pour rapidité de styling
- **tsx** au lieu de ts-node-dev (meilleur support ESM)
- **Alpine Linux** + OpenSSL 3.0 pour Prisma binary
- **Hot reload** via volumes Docker (dev UX)

## 🤖 Prompting

Ce projet a été généré via un plan en sous-tâches séquentielles:
1. Scaffolding monorepo + Docker
2. API tooling + Prisma + migrations
3. Backend routes (auth, progress, quiz)
4. Frontend bootstrap + Tailwind + Router
5. Web architecture + auth state
6. Dashboard + Module + Quiz + Final
7. UI/UX polish + logs + README

Chaque sous-tâche se termine par:
- Tests manuels (curl/browser)
- Commit Git explicite

## 🚦 Statut

✅ Tous les modules implémentés
✅ Gating côté serveur et client
✅ Quiz validation fonctionnelle
✅ Logs structurés
✅ Docker hot reload opérationnel
✅ README complet

---

**Développé avec ❤️ pour les Vibeenengineers**
