<p align="center"><img alt="Directus Logo" src="https://user-images.githubusercontent.com/522079/158864859-0fbeae62-9d7a-4619-b35e-f8fa5f68e0c8.png"></p>

---

## 🐰 Introduction

Welcome! This is the repo for [Directus' documentation](https://docs.directus.io).

**[Learn more about Directus](https://directus.io)**

<br />

## 🖥️ Running the Docs

### Requirements

- Node.js 20
- pnpm

### Install Dependencies

```bash
pnpm install
```

### Setup Environment

```bash
cp .env.example .env
```

### Run Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## ☁️ Deploying the Docs

Due to [a bug in Nitro](https://github.com/nitrojs/nitro/issues/1484), Netlify isn't able to
auto-build this website on pushes to main. Instead, a member of the core team has to deploy it
manually through the [Netlify CLI](https://docs.netlify.com/cli/get-started/).

1. `netlify env:list --plain` – Get a copy of the `.env` you'll need to build the website
1. `pnpm run generate` – Build the website locally
1. `netlify deploy` – This will deploy a staging build to a branch to verify everything looks good.
   Once that's good to go:
1. `netlify deploy --prod` – This will then upload the same thing again but push it live to the prod
   website

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
