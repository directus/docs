---
id: 28299d88-04e5-4cb8-83b1-3916696088e3
slug: fetch-data-from-directus-with-flutter
title: Fetch Data from Directus with Flutter
authors:
  - name: Clara Ekekenta
    title: Guest Author
description: Learn how to integrate Directus in your Flutter app with Dart.
---
## Before You Start
You will need:

- Flutter SDK: Follow the official [Flutter installation guide](https://docs.flutter.dev/get-started/install) for your operating system (Windows, macOS, or Linux). This will also install the Dart programming language, which is required for Flutter development.
- A Directus project - [follow our quickstart guide](/getting-started/overview) if you don't already have one.
-  A code editor installed.
- Knowledge of Dart.

# Initialize Project
On your terminal, navigate to the directory where you want to create your project, and run the following command:

```bash
flutter create my_directus_app
```

Navigate to the project directory, after the project has been created and run the application with the command:

```bash
cd my_directus_app && flutter run
```

This will launch the app on an emulator or connected device. If everything is set up correctly, you should see the default Flutter app running.

Add these dependencies to your `pubspec.yaml` file under the dependencies section:

```yaml
dependencies:
  http: ^0.13.5
  flutter_dotenv: ^5.0.2
  flutter_html: ^3.0.0-alpha.6
```

Create an `.env` file in an `assets` directory of your Flutter project. This file will store your Directus Project URL.

```
DIRECTUS_API_URL=https://your-directus-project.com
```

In your `main.dart` file, import the `flutter_dotenv` package and load the environment variables:

```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';
Future main() async {
  await dotenv.load(fileName: ".env");
  runApp(MyApp());
}
```

# Using Global Metadata and Settings

In your Directus project, navigate to Settings -> Data Model and create a new collection called `global`. Under the Singleton option, select 'Treat as a single object', as this collection will have just a single entry containing global website metadata.

Create two text input fields - one with the key of `title` and one `description`.

Navigate to the content module and enter the global collection. Collections will generally display a list of items, but as a singleton, it will launch directly into the one-item form. Enter information in the title and description field and hit save.

By default, new collections are not accessible to the public. Navigate to Settings -> Access Policies -> Public and give Read access to the Global collection.

Set up a `DirectusService` class to retrieve all the global settings and use them in your project. Create a new file named `directus_service.dart` in your `lib` directory and add the code snippets:

```dart
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
class DirectusService {
  final String _baseUrl = dotenv.env['DIRECTUS_API_URL']!;
   Future<Map<String, dynamic>> getGlobalMetadata() async {
    final response = await http.get(Uri.parse('$_baseUrl/global'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body)['data'];
    } else {
      throw Exception('Failed to load global metadata');
    }
  }
}
```

The above code creates a method to fetch the global metadata settings from Directus.

Import the `DirectusService` class and use it to retrieve global settings and metadata:

```dart
import 'package:flutter/material.dart';
import 'services/directus_service.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
Future main() async {
  await dotenv.load(fileName: ".env");
  runApp(MyApp());
}
class MyApp extends StatelessWidget {
  final DirectusService _directusService = DirectusService();
  MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: Future.wait([
        _directusService.getGlobalMetadata(),
      ]),
      builder: (context,
          AsyncSnapshot<List<Map<String, dynamic>>> settingsSnapshot) {
        if (settingsSnapshot.connectionState == ConnectionState.waiting) {
          return const CircularProgressIndicator();
        } else if (settingsSnapshot.hasError) {
          return Text('Error: ${settingsSnapshot.error}');
        } else {
          final metadata = settingsSnapshot.data![0];
          return MaterialApp(
            title: metadata['title'],
            theme: ThemeData(
              primarySwatch: Colors.blue,
            ),
            home: Scaffold(
              appBar: AppBar(
                title: Text(metadata['title'] ?? 'My App'),
              ),
              body: Center(
                child:
                    Text(metadata['description'] ?? 'No description provided'),
              ),
            ),
          );
        }
      },
    );
  }
}
```

This will use the `FutureBuilder` to fetch the global metadata from Directus. Once the data is loaded, you will use it throughout your application for the app `title`, and `description` of your application.

## Creating Pages With Directus

Create a new collection called pages - add a text input field called `slug`, which will correlate with the URL for the page. For example about will later correlate to the page localhost:3000/about.

Create a text input field called `title` and a WYSIWYG input field called `content`. In Access Policies, give the Public role read access to the new collection. Create 3 items in the new collection - [here's some sample data](https://github.com/directus-labs/getting-started-demo-data).

Add a new method to fetch pages in your `DirectusService` class from Directus in the `directus_service.dart` file:

```
  ...
  Future<Map<String, dynamic>>  getPages() async {
    final response = await http.get(Uri.parse('$_baseUrl/pages'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body)['data'];
    } else {
      throw Exception('Failed to load pages');
    }
  }
  ...
```
Create a page widget to display a single page using the data returned from the page collection. Create a `screens` directory in the `lib` directory. In the `screens` directory, create a `home_screen.dart` file and add the following code snippet:

```
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
class PageWidget extends StatelessWidget {
  final Map<String, dynamic> page;
  const PageWidget({
    super.key,
    required this.page,
  });
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(page['title']),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              Html(
                data: page['content'],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

This will render the content of your `pages` collection and use the `flutter_html` package to convert the WYSIWYG content to HTML. Update the the code in your `main.dart` file to use the page widget:

```
import 'package:flutter/material.dart';
import 'services/directus_service.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'screens/home_screen.dart';
Future main() async {
  await dotenv.load(fileName: ".env");
  runApp(MyApp());
}
class MyApp extends StatelessWidget {
  final DirectusService _directusService = DirectusService();
  MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: Future.wait([
        _directusService.getGlobalMetadata(),
      ]),
      builder: (context,
          AsyncSnapshot<List<Map<String, dynamic>>> settingsSnapshot) {
        if (settingsSnapshot.connectionState == ConnectionState.waiting) {
          return const CircularProgressIndicator();
        } else if (settingsSnapshot.hasError) {
          return Text('Error: ${settingsSnapshot.error}');
        } else {
          final metadata = settingsSnapshot.data![0];
          return MaterialApp(
            title: metadata['title'],
            theme: ThemeData(
              primarySwatch: Colors.blue,
            ),
            home: FutureBuilder<Map<String, dynamic>>(
              future: _directusService.getPages(),
              builder: (context, pagesSnapshot) {
                if (pagesSnapshot.connectionState == ConnectionState.waiting) {
                  return const CircularProgressIndicator();
                } else if (pagesSnapshot.hasError) {
                  return Text('Error: ${pagesSnapshot.error}');
                } else {
                  final pages = pagesSnapshot.data!;
                  return pages.isNotEmpty
                      ? PageWidget(
                          page: pages,
                        )
                      : const Text('No pages found');
                }
              },
            ),
          );
        }
      },
    );
  }
}
```

![Showing the contents from the pages collection in flutter application](/img/93903c78-1437-49e9-9c7c-2f7fa17bd367.webp)

## Creating Blog Posts With Directus
Similar to creating pages, you can also create and manage blog posts using Directus CMS. Create a new collection called `authors` with a single text input field called `name`. Add one or more authors to the collection.

Create another collection called `posts` and add the following fields:

- **slug**: Text input field
- **title**: Text input field
- **content**: WYSIWYG input field
- **image**: Image relational field
- **author**: Many-to-one relational field with the related collection set to `authors`

Add 3 items in the `posts` collection - [here's some sample data](https://github.com/directus-community/getting-started-demo-data).

## Create Blog Post Listing

Add a new method to your `DirectusService` class to fetch blog posts from Directus:

```
 ...
 Future<List<dynamic>> getBlogPosts() async {
    final response = await http.get(Uri.parse('$_baseUrl/posts'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body)['data'];
    } else {
      throw Exception('Failed to load blog posts');
    }
  }
 ...
```

Update the code in your `lib/screens/home_screen.dart` file to render the blog posts in the `PageWidget`:

```
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
class PageWidget extends StatelessWidget {
  final Map<String, dynamic> pages;
  final List<dynamic> blogPosts;
  const PageWidget({
    super.key,
    required this.pages,
    required this.blogPosts,
  });
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(pages['title']),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              Html(
                data: pages['content'],
              ),
              const SizedBox(height: 32),
              Text(
                'Blog Posts',
                style: Theme.of(context).textTheme.headline6,
              ),
              const SizedBox(height: 16),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: blogPosts.length,
                itemBuilder: (context, index) {
                  final blogPost = blogPosts[index];
                  return BlogPostItem(blogPost: blogPost);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
class BlogPostItem extends StatelessWidget {
  final dynamic blogPost;
  const BlogPostItem({
    super.key,
    required this.blogPost,
  });
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            blogPost['title'],
            style: Theme.of(context).textTheme.labelLarge,
          ),
          const SizedBox(height: 8),
          Html(
            data: blogPost['content'],
          ),
        ],
      ),
    );
  }
}`
```

The `PageWidget` accepts `blogPost` which are the blog posts from Directus as a required parameter. Update the code in your `main.dart` file to pass it from the `DirectusService` class instance:

```
import 'package:flutter/material.dart';
import 'services/directus_service.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'screens/home_screen.dart';
Future main() async {
  await dotenv.load(fileName: ".env");
  runApp(MyApp());
}
class MyApp extends StatelessWidget {
  final DirectusService _directusService = DirectusService();
  MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: Future.wait([
        _directusService.getGlobalMetadata(),
        _directusService.getBlogPosts(),
      ]),
      builder: (context, AsyncSnapshot<List<dynamic>> settingsSnapshot) {
        if (settingsSnapshot.connectionState == ConnectionState.waiting) {
          return const CircularProgressIndicator();
        } else if (settingsSnapshot.hasError) {
          return Text('Error: ${settingsSnapshot.error}');
        } else {
          final metadata = settingsSnapshot.data![0];
          final blogPosts = settingsSnapshot.data![1];
          return MaterialApp(
            title: metadata['title'],
            theme: ThemeData(
              primarySwatch: Colors.blue,
            ),
            home: FutureBuilder<Map<String, dynamic>>(
              future: _directusService.getPages(),
              builder: (context, pagesSnapshot) {
                if (pagesSnapshot.connectionState == ConnectionState.waiting) {
                  return const CircularProgressIndicator();
                } else if (pagesSnapshot.hasError) {
                  return Text('Error: ${pagesSnapshot.error}');
                } else {
                  final pages = pagesSnapshot.data!;
                  return pages.isNotEmpty
                      ? PageWidget(pages: pages, blogPosts: blogPosts)
                      : const Text('No pages found');
                }
              },
            ),
          );
        }
      },
    );
  }
}
```

![Display the contents from the posts collection](/img/033e07f5-122d-4457-b026-5a96a45b711b.webp)

## Create Blog Post Detail

Create a new file called `post_single.dart` file in the `lib/screens` directory. Then create a `BlogPostWidget`:

```
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
class BlogPostWidget extends StatelessWidget {
  final Map<String, dynamic> post;
  const BlogPostWidget({super.key, required this.post });
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(post['title']),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
             const SizedBox(height: 8),
            Html(
              data: post['content'],
            ),
            ],
          ),
        ),
      ),
    );
  }
}
```

The `BlogPostWidget` serves as the single blog post view. When a user clicks on a blog post from the listing, the app navigates to this widget, displaying the full content of the selected post.

# Add Navigation

Update the `BlogPostItem` class in the `lib/screens/home_screen.dart` file to add navigation to the project:

```
class BlogPostItem extends StatelessWidget {
  final dynamic blogPost;
  const BlogPostItem({
    super.key,
    required this.blogPost,
  });
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => BlogPostWidget(post: blogPost),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              blogPost['title'],
              style: Theme.of(context).textTheme.labelLarge,
            ),
          ],
        ),
      ),
    );
  }
}
```

With the above code, when the user taps on the `BlogPostItem`, it triggers the `onTap` callback function. Inside this function, the `Navigator.push` will navigate to a new screen. `MaterialPageRoute` will define the widget to be displayed on the new screen as `BlogPostWidget`. Also, the `blogPost` data is passed as a parameter to the `BlogPostWidget` widget. This will allow you to display detailed information about the selected `blog` post on the new screen.

![Navigating to the blog single page](/img/c17cbbe5-174a-4b37-a3bd-2eb31a518bfa.webp)

## Summary

Throughout this tutorial, you've learned how to build a Flutter application that uses data from a Directus project. You started by creating a new project, set up environment variables and everything you need to call Directus. You then created pages and posts collections in Directus and integrated them with the the Flutter.
