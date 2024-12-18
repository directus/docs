---
id: c85e7210-33f1-4475-9de6-040a47bf1f48
slug: content
title: Changelog
authors: []
---
# The Changelog

Each month, some of the Directus team talk through what’s new including core releases, new content and extensions, plus guests showcasing community highlights.

[Watch The Changelog on Directus TV.](https://directus.io/tv/the-changelog)

## November 2024
- In [Directus 11.1.2](https://github.com/directus/directus/releases/tag/v11.1.2), improvements to content versioning and new comment endpoints have been made.
    - For improvements to content versioning, internally, we stored every change to a content version separately in the `directus_revisions` collection, and then merged them together when promoting a version. In this release, we’ve added a new `delta` field to the `directus_versions` collection that combines all revisions into a single field. This means you can prune `directus_revisions` without compromising your content versions.
     - We've introduced a dedicated `directus_comments` collection, replacing the previous system that used `directus_activity` for comments. While new comment endpoints have been added, existing endpoints remain functional. Comment primary keys are now UUIDs instead of numeric values, which may impact custom type checking implementations. The SDK's internal comment endpoints have been updated to reflect this change. To avoid errors, ensure your Directus version is compatible with the latest SDK when using comment functions.
- In [Directus 11.2](https://github.com/directus/directus/releases/tag/v11.2.0), TUS (resumable uploads) now added to Supabase, Azure, Cloudinary, and GCS storage adapters to join AWS and Local Adapters released in 10.13.0.
- The [AI Web Scraper](https://github.com/directus-labs/extensions/tree/main/packages/ai-web-scraper-operation) allows you to scrape web pages and receive structured data back using Firecrawl's web scraping API to extract data from websites.
- The [AI Writer](https://github.com/directus-labs/extensions/tree/main/packages/ai-writer-operation) has been extended to include the option to use multiple AI providers as well as different models.
- The [Tree Map Chart](https://github.com/directus-labs/extensions/tree/main/packages/treemap-chart-panel) presents a cluster or boxes where the size of each box represent the value. You can also group data into categories which are presented in different colors.
- The [Funnel Chart](https://github.com/directus-labs/extensions/tree/main/packages/funnel-chart-panel) presents a list of numbers in an ascending or descending funnel chart.
- The [Scatter Plot Chart](https://github.com/directus-labs/extensions/tree/main/packages/scatter-plot-panel) is a 2-axis chart where values are plotted as dots. You can optionally add axis labels and hover over any of the dots to see the values.
- The [Timeline Chart](https://github.com/directus-labs/extensions/tree/main/packages/timeline-chart-panel) presents a series of tasks or events with a start and end date on a graph. You can also group data into categories on the y axis and seperate tasks into different colors.
- The [Customizable Tabular Layout Boilerplate](https://github.com/directus-labs/extensions/tree/main/boilerplates/tabular-layout) give extension authors the ability to use it as a base for their customizations.

## October 2024

- In [Directus 11.1.1](https://github.com/directus/directus/releases), a number of bug fixes and optimizations were included. We’ve also removed the dedicated SendGrid email transport and you should replace it with SMTP.
- [Directus Cloud Templates](https://directus.cloud/) for website CMS, CRM and eCommerce projects are available to use within Directus Cloud. The templates enable you to have the data models, permissions and flows pre-configured to get started quicker. You can select a template when creating a new project on Directus Cloud.
- The [Gantt Chart Layout](https://github.com/directus-labs/extensions/tree/main/packages/gantt-chart-layout) displays items in a collection in a gantt chart, helping those of you who use Directus for project management and task management. You can specify a label that you want displayed on each task, a start date and an end date and optionally, a dependency field which will draw dependency lines in a chart, and also specify the zoom in as granular as an hour and as broad as a year.
- The [Calculated Field Interface](https://github.com/directus-labs/extensions/tree/main/packages/calculated-fields-bundle) allows you to write a formula and the value of the interface will be automatically computed and shown. It supports the full set of functions provided by Formula.js, and a majority of JavaScript operators that work for numbers and strings. It also supports relational fields and we parse formulas to ensure they are only running allowed functions which is important for security. Important to note, values here are only visible in the interface and not in API responses.
- The [API Metric Panel](https://github.com/directus-labs/extensions/tree/main/packages/api-metric-panel) can be used to display a value from an external API. For example, the number of docker downloads or sales or followers on social media platforms. You can make a web request to get your preferred metrics, you can also provide custom headers or a request body if required, then specify the path of the value you want to display.

## September 2024

- [Directus 11.1.0](https://github.com/directus/directus/releases/v11.1.0), you can now [stream system logs](/user-guide/settings/system-logs) inside of the Directus Data Studio to have greater visibility and debug problems. You can filter by log level or node in a multi-node deployment.
- We added support for listening on a Unix socket path as opposed to host and port.
- You can now customize the invite link expiry time.
- Indices are now supported through the new `is_indexed` field, which means you don’t have to do this directly in your database anymore.
- Using the [LiquidJS template operation](https://github.com/directus-labs/extensions/tree/main/packages/liquidjs-operation) enables dynamically-generated content creation, perfect for creating personalized emails or any scenario where you need to combine data with templates within a flow.
- [Resend email operation](https://github.com/directus-labs/extensions/tree/main/packages/resend-operation) integrates Resend's powerful email API into your Directus flows.
- The [Table in Insight Panel](https://github.com/directus-labs/extensions/tree/main/packages/table-view-panel) facilitates output data from across multiple tables, if you click an item, it'll open a Directus Editor draw.
- [Plausible Analytics Bundle](https://github.com/directus-labs/extensions/tree/main/packages/plausible-analytics-bundle) embeds your Plausible dashboard right within your Directus Insights dashboard or your content editor.
- The [Flow Trigger Bundle](https://github.com/directus-labs/extensions/tree/main/packages/flow-trigger-bundle) allows you to run manually-triggered flows from right within a dashboard or within your content editor.
- [List interface](https://github.com/directus-labs/extensions/tree/main/packages/simple-list-interface) enables the easy creation and management of simple lists with full keyboard support.
- A [global command palette](https://github.com/directus-labs/extensions/tree/main/packages/command-palette-module) extension is now available - giving you CMD/Ctrl+K across Directus. Navigate the Data Studio, run flows, and copy API endpoints from anywhere.
- [WYSIWYG](https://github.com/directus-labs/extensions/tree/main/boilerplates/input-rich-text-html) & [Block Editor](https://github.com/directus-labs/extensions/tree/main/boilerplates/input-block-editor) Boilerplates give extension authors the ability to use them as a base for their customizations.

## August 2024

- [Directus 11.0.0](https://github.com/directus/directus/releases/v11.0.0) contains a new permissions system that's based on access policies, nested roles, and a switch to mysql2. 
- [Directus Cloud pricing changes](https://directus.io/blog/a-change-in-our-pricing-july-2024) including the introduction of a new starter tier at $15/month.
- [Audio player interface](https://github.com/directus-labs/extensions/blob/main/packages/audio-player-interface/README.md) extension allows an audio source to be selected and displays an audio player from an URL or a local file from Directus.
- [Video player interface](https://github.com/directus-labs/extensions/blob/main/packages/video-player-interface/README.md) extension allows a video from YouTube, Vimeo or a local file from Directus to be selected and a video player to be displayed.
- [PDF viewer interface](https://github.com/directus-labs/extensions/blob/main/packages/pdf-viewer-interface/readme.md) extension enables a view of PDF files from within the item editor.
- [Spreadsheet layout](https://github.com/directus-labs/extensions/blob/main/packages/spreadsheet-layout/README.md) extension allows the editing of item fields directly inline, similar to a spreadsheet.
- [RSS to JSON operation](https://github.com/directus-labs/extensions/blob/main/packages/rss-to-json-operation/README.md) extension returns an RSS Feed as a JSON object inside of flows as a custom operation.
- [Multilevel autocomplete interface](https://github.com/directus-labs/extensions/blob/main/packages/multilevel-autocomplete-api-interface/readme.md) extension allows you to get data from nested API queries.
- [Whiteboard interface](https://github.com/directus-labs/extensions/blob/main/packages/whiteboard-interface/readme.md) extension adds a field to your collection for drawing sketches and ideas.
- [Experimental M2A presentation interface](https://github.com/directus-labs/extensions/blob/main/packages/experimental-m2a-interface/readme.md) extension enables the adding of a matrix button selector to the built-in M2A interface.