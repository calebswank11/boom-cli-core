# ⚡ BOOM!Scaffold — Fullstack in Seconds

**BOOM!Scaffold** is a schema-first scaffolding engine that turns your data model into a fully-typed, production-grade TypeScript stack in seconds — backend, frontend, and infra.

Ideal for solo founders, internal tools, MVPs, and anyone who wants to skip the boilerplate and ship faster.

##### 🎯 Playground
https://www.boomscaffold.com/playground/

---

## 🚀 What It Does

From a single config file + your schema, BOOM!Scaffold generates:

- A full API — either **GraphQL** or **REST (Express)**
- A backend powered by either **Knex** or **Sequelize**
- A modern frontend (hooks, UI config, Tailwind)
- End-to-end typing + data services
- Optional admin panel, CI/CD, infra (AWS/CDK)

All in under 60 seconds.

---

## 🧪 Quickstart

### Install (coming soon via npm):

```bash
npm i @boomscaf/cli
```

Or, if you’re cloning locally:

```bash
git clone https://github.com/calebswank11/boom-cli-core.git
cd boom-cli-core
yarn && yarn dev
```

---

### Run the Scaffold (CLI):

Ensure you have a SQL schema in `./sqlInput/` and a `scaffold.config.json` at the root.

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

### Example Input

**SQL Schema: `./sqlInput/example.sql`**

```sql
CREATE TABLE user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user'
);
```

**Scaffold Config: `scaffold.config.json`**

```json
{
  "project": "my-app",
  "inputRoot": "./sqlInput",
  "orm": "knex",            // or "sequelize"
  "apiType": "graphql",     // or "express"
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

Your scaffold adapts to your stack. Whether you choose **Knex + GraphQL**, **Sequelize + REST**, or any combo, you'll get a clean, structured project:

**Backend:**

```
build/
├── enums/           # Auto-generated enums
├── migrations/      # Migration files (Knex or Sequelize)
├── seeds/           # Seed data
├── src/
│   ├── @types/      # Global TS types
│   ├── config/      # DB/API config
│   ├── database/    # Connection logic
│   ├── dataServices/# CRUD helpers (Knex or Sequelize)
│   ├── ?resolvers/  # GraphQL resolvers (if selected)
│   ├── ?controllers/# REST controllers (if selected)
│   ├── ?models/     # REST models (if selected)
│   ├── ?routes/     # Express routes (if selected)
│   ├── ?typedefs/   # GraphQL typeDefs
│   └── utils/       # Misc helpers
├── app/             # Optional frontend
├── cicd/            # GitHub Actions
├── cloudOps/        # AWS/CDK infra
└── index.ts         # CLI entry
```

**Frontend (if enabled):**

```
app/
├── api/             # Query/mutation clients or REST calls
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

Add your DB secrets, build business logic, and launch 💥

---

## 🔧 Features

- 🧠 **Schema-based generation** — just define your DB schema
- 🔁 **Knex or Sequelize** — choose your preferred SQL ORM
- 🔀 **GraphQL or REST** — pick your API type, or scaffold both
- 🧬 **Typed everything** — from services to typedefs
- 🎨 **Tailwind UI + hooks** — generated from your schema

---

## 🛠 Developer Workflow

1. Create your schema (SQL or DSL)
2. Configure `scaffold.config.json`
3. Run the CLI:

    ```bash
    npx @boomscaf/cli@ init
    ```

4. Update config as needed
5. Re-run the scaffold:

    ```bash
    npx @boomscaf/cli generate
    ```

6. Build on top. Done.

---

## 📌 Use Cases

- 🧑‍💻 Solo devs building MVPs
- 🏢 Internal tooling
- 🧬 Data-first product backends
- 🛒 Marketplaces
- ⚙️ Reusable scaffolds across teams

---

## 🚧 Roadmap
| Feature                                    | Purpose                                                  |
| ------------------------------------------ | -------------------------------------------------------- |
| 🔄 **Inline rescaffolding**                | Detect schema changes and update files non-destructively |
| 🔐 **JWT auth, rate limiting, versioning** | Add production-ready security out of the box             |
| 🧠 **Ollama integration**                  | Natural-language prompts to generate scaffold features   |
| 🧱 **Admin CRUD dashboards**               | Auto-generate admin panels tied to schema                |
| 🧮 **AI DB Designer**                      | Visual schema builder with config export                 |
| 💻 **Toggleable test output**              | Optional test file scaffolding with Jest or other libs   |
| ☁️ **AWS CDK / Terraform / Pulumi**        | Scaffold infrastructure as code                          |
| 🔄 **CI/CD + Docker + GitHub Actions**     | Generate deployment and container setup                  |
| 📘 **Auto-generated API docs**             | Create OpenAPI or GraphQL schema docs automatically      |
| 🧭 **Frontend route generator**            | Automatically maps schema resources to frontend pages    |
| 🧰 **Design system starter**               | Tailwind-based base components, forms, layouts           |
| 💫 **Frontend animation presets**          | Smooth entry/exit transitions, especially for admin UIs  |
| 🔐 **RBAC support**                        | Add field- and route-level access rules from config      |
| 📁 **Modular plugin support**              | Eventually allow community plugin generation             |
| ✍️ **Schema linter + formatter**           | Validate/enforce schema structure before scaffolding     |

---

## 💬 Feedback

We’re building fast. Hit something weird? Want a new feature?
Drop us a note or [submit feedback here](https://github.com/calebswank11/boom-cli-core/issues).
