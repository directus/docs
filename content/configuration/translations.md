---
title: Translations
description: Directus supports translations for both the Data Studio UI and authored content.
---

There are two types of translations in Directus: Data Studio translations and content translations.

## Data Studio Translations

Data Studio translations are used to translate the user interface of the Data Studio. The application supports internationalization across the entire App. Many languages are currently supported, with more being added all the time. Anyone can add or refine any languages through our [locales project](https://locales.directus.io).

### Releasing New Translations

As soon as a translation is edited on our translation platform, a pull request is created in our repository, which contains the corresponding changes. This pull request is usually included in the subsequent release of Directus.

### Translation Strings

![Translation Strings show in a standard Directus Explore page.](/img/f991854a-5abb-49a6-b6b4-2163b2ed27fe.webp)

Any strings can be translated in the Data Studio through the decicated translation strings section of the settings module. Each entry in the translation strings has a `key` that is used in the data studio, and any number of translations. 

![Translation strings can be used anywhere the translation icon is shown..](/img/1696e3b0-2ed0-4318-b209-cd7959326bef.webp)

Throughout the Data Studio, click the :icon{name="material-symbols:translate"} icon to assign a translation string to the field's value. The correct translation will now be shown based on the user language preference. If a language is chosen for which there is no translation string, the translation `key` will be displayed instead.

## Content Translations

![Translations interface showing text in American English and German.](/img/3e9a8108-169f-4df8-988b-e966b3809d1b.webp)

Content translations are used to translate the content of the database, which can be served via API to your external applications. The built-in translations interface handles much of the complexity in managing your data model for multilingual content. 

The `languages` collection will be automatically created when you add your first translations field. It contains each language you support, with a `code` and `direction` field (some languages are written right-to-left).

The field will also create a new collection-specific collection for translated content, for example `articles_translations`. Add fields you wish to translate to this collection, and they will be displayed in the translations interface.

