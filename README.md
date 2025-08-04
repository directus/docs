<p align="center"><img alt="Directus Logo" src="https://user-images.githubusercontent.com/522079/158864859-0fbeae62-9d7a-4619-b35e-f8fa5f68e0c8.png"></p>

---

## 🐰 Introduction

Welcome! This is the repo for [Directus' documentation](https://docs.directus.io).

**[Learn more about Directus](https://directus.io)**


## 🖥️ Running the Docs

### Requirements

- Node.js 22
- pnpm

### Install Dependencies

```bash
pnpm install
```

### Setup Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Update the environment variables in the `.env` file with proper secret keys for the different
services.

### Run Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

### Building Locally

```bash
pnpm build
```

## ☁️ Deploying the Docs

The documentation automatically deploys to Vercel when changes are merged into the main branch. Simply:

1. Open a Pull Request with your changes
2. This should trigger a deploy preview as well.
3. Once PR is approved and merged to main, Vercel will automatically build and deploy the updated documentation

## 🚀 Contributing

- [Code of Conduct](https://directus.io/docs/community/overview/conduct)
- [Contributing and authoring guidelines](https://directus.io/docs/community/contribution/documentation)

<br />

## 🤔 Community Help

- [Community Platform](https://community.directus.io) (Questions, Live Discussions)
- [GitHub Issues](https://github.com/directus/docs/issues) (Report Bugs)
- [GitHub Discussions](https://github.com/directus/docs/discussions) (Feature Requests)

<br />

© 2004-2024, Monospace, Inc.
