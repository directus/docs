---
title: Extensions Overview
description: Extensions are used to extend the functionality of Directus.
navigation:
  title: Overview
---

:video-embed{video-id="c7ab64da-f34d-42c9-8a1a-03e6026cc7e5"}

Directus has been built to be extensible - both allowing for powerful enhancements to be built for single projects, and for publishing in the [Directus Marketplace](/guides/extensions/marketplace).

Extensions in Directus run within the same environment as the main application, allowing them to leverage existing access to underlying [services](/guides/extensions/api-extensions/services) and [UI components](/guides/extensions/app-extensions/ui-library).

## App Extensions

[App Extensions](/guides/extensions/app-extensions) extend the functionality of the Data Studio.

### Interfaces

![An "input" in the content module](/img/e0712e22-1cda-403b-9903-7e20aa473701.webp)

[Interfaces](/guides/extensions/app-extensions/interfaces) are form inputs used primarily inside of the :product-link{product="editor"}. Interfaces are the primary way users interact with data inside of Directus. Custom interfaces can be used for use cases with unique interaction needs, complex data entry, and any time you need to add elements to the editor.

### Displays

![A Datetime display in the content module](/img/99a21abb-a866-4766-bbce-0ed13295112b.webp)

[Displays](/guides/extensions/app-extensions/displays) are small components that are used to display a single value throughout the Data Studio. Displays receive a single value and any custom display options that are defined in the display entrypoint. They are then expected to render the value in a user-friendly way.

### Layouts

![A table display in the content module](/img/ca3ceb27-7cbd-493d-acb1-d15cb707fb31.webp)

[Layouts](/guides/extensions/app-extensions/layouts) allow for listing of items in :product-link{product="explore"} pages. Layouts receive a collection, filters, searches, and any custom layout options that are defined in the layout entrypoint. They are then expected to fetch and render the items from a collection.


### Panels

![A panel in the insights module](/img/cd83e252-c23b-4e03-b2f4-dc35cee2d6a7.webp)

[Panels](/guides/extensions/app-extensions/panels) are customizable components within :product-link{product="insights"} dashboards. Panels are the building blocks of analytics dashboards, enabling rapid, no-code creation of data visualizations with data from a Directus project. Panels can also contain interactive elements, making them suitable for building custom internal applications within dashboards. 

### Modules

![A module in Directus](/img/7db9b50a-d25b-40b1-86dc-3e09dad388bf.webp)

[Modules](/guides/extensions/app-extensions/modules) are top-level areas of the Data Studio, navigated to from the left-hand module bar. They will load at the specified routes. The Data Studio splits up functionality into modules - the content module, the files module, the user module, the insights module, and the settings module. Extensions can add new modules to the Data Studio.

### Themes

![Directus' default theme](/img/91797ca8-68fa-4231-b143-8d5e134e9981.webp)

[Themes](/guides/extensions/app-extensions/themes) are used to style the Data Studio. They can be used to change the colors, fonts, and other visual elements of the Data Studio.

## API Extensions

[API Extensions](/guides/extensions/api-extensions) extend the functionality of the API.

### Hooks

[Hooks](/guides/extensions/api-extensions/hooks) allow running code when events occur within Directus. Events are triggered on schedules, database events, or during the Directus application lifecycle.

### Endpoints

[Endpoints](/guides/extensions/api-extensions/endpoints) allow you to register new API routes in your Directus project.

### Operations

[Operations](/guides/extensions/api-extensions/operations) are single steps in a Flow - the no-code automation tool part of :product-link{product="automate"}.
