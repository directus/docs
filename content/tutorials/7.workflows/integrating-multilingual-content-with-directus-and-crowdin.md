---
id: 84f37f00-629b-4b38-8d18-9d92cc4b2f0c
slug: integrating-multilingual-content-with-directus-and-crowdin
title: Integrating Multilingual Content with Directus and Crowdin
authors:
  - name: Diana Voroniak
    title: Product Marketing Manager, Crowdin
description: Learn how to localize content in Directus using Crowdin's connector with Directus.
---
Picture this: your app welcomes users with a friendly "hello" in English, a warm "hola" in Spanish, or a cheerful "bonjour" in French. That's the magic of content localization, and it's your ticket to connecting with users worldwide. If you're new to the multilingual game, fear not! Let's dive into a world where Directus and Crowdin play the hero's role, guiding you to create multilingual apps and automate most of the work.

## Content Localization: Making Your App Global

Do you know how you code to make your app run smoothly? Content localization is like teaching your app to understand various languages. It's not just about translating words; it's about adapting your app's voice to different cultures. When your app speaks a user's language, it instantly becomes relatable and engaging.

Imagine Directus as your trusty companion on the journey to multilingual content. Directus lets you customize your app for each language, showing dates, times, and other elements as users expect. Plus, Directus integrates seamlessly with Crowdin, which we will talk about later.

When discussing Directus and multilingual projects, there are two different places to take action:

1. **Multilingual Content**: Storing versions of content in collections in different languages. This is often exposed in a separate application like a website or phone app.
2. **Directus Data Studio**: Making the Directus web application multilingual through [translation strings](/guides/content/translations). This is commonly an internal or authoring interface, but some users have many or all users touch the Data Studio.

There are many translation strings built-in to the Directus project for elements that appear in every project, but you can create as many custom strings as you want, to utilize them/ inside of your project - both inside of the data studio, and via API.

## Set Up Multilingual Content

This post will focus on translating the Directus Data Studio, but here is a summary brief summary on how to set up multilingual content translations in Directus:

1. **Project Preparation**: Begin by backing up your data and configurations in Directus to ensure a safe starting point.
2. **Language Setup**: Introduce multiple languages effortlessly in Directus by accessing project settings and adding the languages you need.
3. **Localization Customization**: Personalize your app's localization by identifying fields that need adaptation and marking them as "Localized."
4. **Preparing for Translation**: Gather textual content for translation and export it using Directus' export features.
5. **Collaboration with Translators**: Collaborate effectively with professionals or community contributors to your translation team to ensure accurate translations.
6. **Entering Translations**: Input translations into your Directus project by navigating to relevant collections and entries and pasting the translated content.
7. **Displaying Localized Content**: Develop your app's front-end and integrate with the Directus API to retrieve content in the desired language.
8. **Testing and Continuous Improvement**: Thoroughly test your app for localized content, gather user feedback, and make iterative improvements for an optimal user experience.

For detailed step-by-step instructions, explore the [content translation reference](/guides/content/translations).

## Contribute Translations To The Directus Data Studio

Contributing to the translation process and translating the Directus project itself is a collaborative effort you can make. Here's how you can actively participate and ensure Directus Data Studio is available in multiple languages:

1. **Crowdin Account Creation**: If you don't already have a Crowdin account, start by [creating one](https://accounts.crowdin.com/register?utm_source=docs.directus.io&utm_medium=referral&utm_campaign=guest-post).
2. **Join the Directus Translation Project:** Once you have a Crowdin account, search for the "Directus" project within Crowdin or simply [join this project](https://crowdin.com/project/directus?utm_source=docs.directus.io&utm_medium=referral&utm_campaign=guest-post) to gain access.
3. **Translating Strings**: Inside the Directus project, you'll find various languages and files with strings and phrases that require translation. Go to Language > Files or Translate All, and click on each string to enter translations for different languages.
4. **Collaboration:** Crowdin enables collaboration with other translators. You can discuss translations, ask questions, and provide context to ensure accurate translations.

The core team behind Directus have set up an automation that will open a pull request as soon as there are community-generated changes to the translation strings. They are then merged pending a review, same as changes to code or docs, to become part of the subsequent releases.

If you're interested in contributing new languages that aren't already in the Directus Translation Project, please reach out to the Directus core team!

##  Change Language In The Directus Data Studio

If your language is already available on Directus, you can change the UI in a few clicks. Here's how to change the language within a Directus project itself:

1. **Log in to Directus**: Access your Directus admin panel and log in with your credentials.
2. **Access Language Settings**: Navigate to the settings section of your Directus project. Look for the language settings.
3. **Select Preferred Language**: Choose the language you want to set as the default for your Directus project. This language will determine the app's interface language for users.
4. **Save Changes**: After selecting the preferred language, save your changes. Your Directus project will now display its interface in the chosen language.

## Add New Translation Strings Using The Crowdin Connector

Now, let's delve into the heart of multilingual content management. This is where we should introduce Crowdin - a localization software created to simplify the translation process and ensure your app speaks fluently in every tongue.

We'll explore how to utilize the [Crowdin connector](https://store.crowdin.com/directus-translation-strings?utm_source=docs.directus.io&utm_medium=referral&utm_campaign=guest-post) to add new translation strings to your Directus project:

1. **Install Crowdin Connector:** If you haven't already, install the Crowdin connector for Directus.
2. **Configuration**: Configure the Crowdin connector with your Directus URL, email, and password. It's recommended to set up a dedicated user in your project for the connector.
3. **Export Content for Translation**: Use the connector to export translation strings from your Directus project to Crowdin.
4. **Collaborate with Translators**: Invite professional translators or your community to contribute translations through Crowdin's user-friendly interface. They can access the platform and provide translations directly within Crowdin.
5. **Import Translations:** Once translations are completed and reviewed in Crowdin, import them back into your Directus project using the connector.
6. **Testing and Validation:** Test your Directus project with the newly imported translations to ensure everything displays correctly and in the right context.

As your content evolves, use the integration to keep translations updated - manage updates, new strings, and changes through Crowdin's interface.

Refer to the latest [integration](https://store.crowdin.com/directus-translation-strings?utm_source=docs.directus.io&utm_medium=referral&utm_campaign=guest-post) documentation for the most accurate and up-to-date instructions. Or, you can always contact the Crowdin [support team](https://crowdin.com/contacts?utm_source=docs.directus.io&utm_medium=referral&utm_campaign=guest-post) (available 24/7).

## A World Of Multilingual Possibilities

As you embark on your multilingual journey, remember that [Directus and Crowdin](https://store.crowdin.com/directus-translation-strings?utm_source=docs.directus.io&utm_medium=referral&utm_campaign=guest-post) are your trusty companions. Content localization isn't just about translating words; it's about creating connections and understanding. In a world where languages blend and cultures unite, your code becomes the bridge that brings people together. With Directus and Crowdin, you're not just coding; you're crafting an inclusive digital world where everyone's voice is heard and understood.
