
# ⚡ BOOM!Scaffold — Fullstack in Seconds

**BOOM!Scaffold** is a schema-first scaffolding engine that turns your data model into a fully-typed, production-grade TypeScript stack in seconds — backend, frontend, and infra.

Ideal for solo founders, internal tools, MVPs, and anyone who wants to skip the boilerplate and ship faster.

---

## 🚀 What It Does

From a single config file + your schema, BOOM!Scaffold generates:

- A full GraphQL API (resolvers, typedefs, services)
    
- A modern frontend (hooks, UI config, Tailwind)
    
- End-to-end typing + data services
    
- Optional admin panel, CI/CD, infra (AWS/CDK)
    

All in under 60 seconds.

---

## 🧪 Quickstart

### Install (coming soon via npm):

```bash
npm install -g @boom/cli
```

Or, if you’re cloning locally:

```bash
git clone https://github.com/calebswank11/boom-cli-core.git
cd boom-cli-core
yarn && yarn build
```

---
### Run the Scaffold:

Make sure you have a SQL schema in `./sqlInput/` and a `scaffold.config.json` at root.

Then generate your fullstack scaffold:

```bash
boom init
```

You’ll see:

```bash
   ___   ___ __
  / _ ) / // __)
 / _ < /_/\__\
/____/(_)(___/

BOOM!Scaffold
```

---

### Example Input:

**`./sqlInput/example.sql`**

```sql
CREATE TABLE user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user'
);
```


### Input: `scaffold.config.json`

The CLI takes a single config file that drives your entire scaffold.

```json
{
  "project": "my-app",
  "inputRoot": "./sqlInput",
  "orm": "knex",
  "apiType": "graphql",
  "library": "apollo-server",
  "database": {
    "client": "pg",
    "connection": "..."
  },
  "outputs": {
    "api": true,
    "frontend": true,
    "adminPortal": false
  },
  "frontEnd": {
    "framework": "react",
    "ui": "tailwind"
  },
  "deployment": {
    "ci": "github-actions",
    "infra": "aws-cdk"
  }
}
```

---

## 📦 Output Structure

**Backend:**

```
build/
├── enums/           # Auto-generated enums
├── migrations/      # migration files
├── seeds/           # Seed data
├── src/
│   ├── @types/      # Global TS types
│   ├── config/      # DB/API config
│   ├── database/    # Connection logic
│   ├── dataServices/# CRUD helpers
│   ├── resolvers/   # GraphQL resolvers
│   ├── typedefs/    # GraphQL typeDefs
│   └── utils/       # Misc helpers
├── app/             # Optional frontend
├── cicd/            # GitHub Actions
├── cloudOps/        # AWS/CDK infra
└── index.ts  # CLI entry
```

**Frontend (if enabled):**

```
app/
├── api/             # Query/mutation clients
├── config/ui/       # Tailwind UI config
├── hooks/           # Auto-generated React/Solid/Svelte/Vue hooks
├── store/           # Global state
└── pages/           # Optional routing structure
```

---

### Next Up:

```bash
cd build && yarn && yarn dev
```

Add your DB secrets, hook up the logic, and go 💥

---

## 🔧 Features

- 🧠 **Schema-based generation** — just define your DB schema
    
- 🧬 **Typed everything** — from services to typedefs
    
- ⚡ **GraphQL API** out of the box
    
- 🎨 **Tailwind UI + hooks** generated from models
    
- 🧪 **Toggleable test output**
    
- 🔐 **JWT auth, rate limiting, versioning**
    
- ☁️ **AWS CDK support**
    
- 🔄 **CI/CD with GitHub Actions + Docker**
    

---

## 🛠 Developer Workflow

1. Create your schema (e.g., SQL or DSL format)
    
2. Run the CLI:
    
    ```bash
    npx @boom/cli init
    ```
    
3. Update `scaffold.config.json` if needed
    
4. Re-run to generate:
    
    ```bash
    npx @boom/cli generate
    ```
    
5. Wire up secrets, build business logic, and go.
    

---

## 🧩 Optional Add-ons (Coming Soon)

- 🔧 REST API output
    
- 🧱 Admin CRUD dashboards
    
- 📘 Auto-generated API docs
    
- 🧪 Storybook / UI preview environment
    
- 🧮 Visual DB designer
    

---

## 📌 Use Cases

BOOM!Scaffold is perfect for:

- 🧑‍💻 Solo devs building MVPs
    
- 🏢 Internal tooling
    
- 🧬 Data-first product backends
    
- 🛒 Marketplaces
    
- ⚙️ Teams that want repeatable fullstack scaffolds
    

---

## 💬 Feedback / Roadmap

We’re building fast. If you hit something weird or want a feature, reach out or [submit feedback here](https://www.boomscaffold.com).
