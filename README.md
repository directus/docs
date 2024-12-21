<p align="center"><img alt="Directus Logo" src="https://user-images.githubusercontent.com/522079/158864859-0fbeae62-9d7a-4619-b35e-f8fa5f68e0c8.png"></p>

---

> [!IMPORTANT]  
> This documentation is in beta. We eagerly welcome your feedback!

## 🐰 Introduction

Welcome! This is the repo for [Directus' documentation](https://docs.directus.io).

**[Learn more about Directus](https://directus.io)**

<br />

## 🖥️ Running the Docs

### Requirements

* Node.js 20
* pnpm

### Install Dependencies

```bash
pnpm install
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

1. `netlify build` – Build the website locally. This'll pull in the required env variables from our
   Netlify team, and use the build command as configured in `netlify.toml`
2. `netlify deploy` – This will deploy a staging build to a branch to verify everything looks good.
   Once that's good to go:
3. `netlify deploy --prod` – This will then upload the same thing again but push it live to the prod
   website

## 🚀 Contributing

* [Code of Conduct](https://docs.directus.io/community/overview/conduct)
* [Contributing and authoring guidelines](https://docs.directus.io/community/contribution/documentation)

<br />

## 🤔 Community Help

- [Discord](https://directus.chat) (Questions, Live Discussions)
- [GitHub Issues](https://github.com/directus/docs/issues) (Report Bugs)
- [GitHub Discussions](https://github.com/directus/docs/discussions) (Feature Requests)

<br />


© 2004-2024, Monospace, Inc.
