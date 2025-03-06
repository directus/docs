---
id: 9a8f3c14-f969-4d2a-9b00-5b22f5dcdc33
slug: fetch-data-from-directus-with-laravel
title: Fetch Data from Directus with Laravel
authors:
  - name: Ekekenta Clinton
    title: Guest Author
description: Learn how to integrate Directus in your Laravel web application.
---
In this tutorial, you will learn how to build a website using Directus as a Headless CMS. You will store, retrieve, and use global metadata such as the site title, create new pages dynamically based on Directus items, and build a blog.

## Before You Start

You will need:

- [PHP 7.4](https://www.php.net/releases/7_4_0.php) or higher
- [Composer](https://getcomposer.org/)
- A code editor on your computer.
- A Directus project - follow our [quickstart guide](/getting-started/overview) if you don't already have one.
- Some knowledge of Laravel.

The code for this tutorial is available on my [GitHub repository](https://github.com/directus-labs/blog-example-getting-started-laravel).

Set up a new Laravel project move into the project directory by running the following commands:

```shell
composer create-project laravel/laravel directus-laravel-blog
cd directus-laravel-blog
```

## Creating a Directus Module

Create a new service provider with the following command:

```shell
php artisan make:provider DirectusServiceProvider
```

Update the `app/Providers/DirectusServiceProvider.php` file with the following code:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Http;

class DirectusServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton('directus', function ($app) {
            return new class {
                protected $baseUrl;

                public function __construct()
                {
                    $this->baseUrl = rtrim(env('DIRECTUS_URL'), '/');                }

                public function request($method, $endpoint, $data = [])
                {
                    $url = "{$this->baseUrl}/items/{$endpoint}";
                    return Http::$method($url, $data);
                }

                public function get($endpoint, $params = [])
                {
                    return $this->request('get', $endpoint, $params);
                }
            };
        });
    }
}
```

This defines a `DirectusServiceProvider` class which creates a singleton instance for interacting with a Directus API. It provides methods to make HTTP requests to the API, with the base URL set from environment variables.

## Using Global Metadata and Settings

Create a new collection named `global` in your Directus project by navigating to **Settings -> Data Model**. Choose 'Treat as a single object' under the Singleton option since this collection will have just one item with global website metadata in it.

Create two text input fields, one with the key `title` and the other with `description`.

Navigate to the content module and enter the global collection. Collections will generally display a list of items, but as a singleton, it will launch directly into the one-item form. Enter information in the title and description field and hit save.

By default, new collections are not accessible to the public. Navigate to Settings -> Access Policies -> Public and give Read access to the `global` collection.

Create a `HomeController` with the command:

```shell
php artisan make:controller HomeController
```

Open the `app/Http/Controllers/HomeController.php` that was created with the above command, and use the `DirectusServiceProvider` class instance to a call to the Directus backend to fetch global metadata.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $directus = app('directus');
        $settingsResponse = $directus->get('global');
        $settings = $settingsResponse['data'];
        return view('home', compact('settings'));
    }
}
```

The `DirectusServiceProvider` registers a singleton instance of Directus API, which can be accessed throughout the application using `app('directus')`. The `HomeController` uses this instance to fetch global settings from the Directus backend and pass them to the view.

Create a `home.blade.php` file in the `resources/views` directory and add the following code to render the global metadata settings:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $settings['site_title'] }}</title>
</head>
<body>
    <h1>{{ $settings['site_title'] }}</h1>
    <p>{{ $settings['site_description'] }}</p>
</body>
</html>
```

Edit the code in your `routes/web.php` file to add a new route for the `HomeController` view:

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;

Route::get('/', [HomeController::class, 'index']);
```

![Home page withg global metadata settings](/img/8c4581b7-59f0-4584-94ed-5f3ae27c5239.webp)

## Creating Pages With Directus

Create a new collection named `pages`, create a text input field called `slug` that corresponds to the page's URL. For instance, the page `localhost:3000/about` will correspond to the about page.

Create a `WYSIWYG` input field named `content` and a text input field named `title`. In Access Policies, give the Public role read access to the new collection. Create 3 items in the new collection - [here's some sample data](https://github.com/directus-labs/getting-started-demo-data).

In your project terminal, create a `PageController` with the command:

```shell
php artisan make:controller PageController
```

Open the `app/Http/Controllers/PageController.php` file created with the above command and add the following code:

```
<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
class PageController extends Controller
{
    public function show($slug)
    {
        $directus = app('directus');
        $pageResponse = $directus->get('pages', [
            'filter' => ['slug' => $slug]
        ]);
        $page = $pageResponse['data'][0];
        return view('page', compact('page'));
    }
}
```
The above code uses the Directus instance to fetch the page data from the Directus backend and pass them to the view.

Create a new blade view file named `page.blade.php` in your `resources/views` directory and add the following code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $page['title'] }}</title>
</head>
<body>
    <h1>{{ $page['title'] }}</h1>
    {!! $page['content'] !!}
</body>
</html>
```

Edit the `routes/web.php` file to add a new route for the `PageController` view:

```php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PostController;

Route::get('/page/{slug}', [PageController::class, 'show']);
Route::get('/', [HomeController::class, 'index']);
```

Navigate to `http://127.0.0.1:8000/page/about` to view the About page.

![dynamic about page](/img/3eaa88b8-b18c-4f81-9a33-17f178f80c2f.webp)

### Creating Blog Posts With Directus

Create a new collection called `authors` and include a single `name` text input field. Create one or more authors.

Create another collection called `posts` and add the following fields:

- title (Type: String)
- slug (Type: String)
- content (Type: WYSIWYG)
- image (Type: Image relational field)
- author (Type: Many-to-one relational field with the related collection set to authors)

Add 3 items in the posts collection - [here's some sample data](https://github.com/directus-community/getting-started-demo-data).

Create a `app/Http/Controllers/PageController.php` file by running the command:

```shell
php artisan make:controller PageController
```

Update the `app/Http/Controllers/PageController.php` file with the following code:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index()
    {
        $directus = app('directus');
        $postsResponse = $directus->get('posts', [
            'sort' => ['-date_created'],
            'limit' => 10
        ]);
        $posts = $postsResponse['data'];

        return view('posts.index', compact('posts'));
    }

    public function show($id)
    {
        $directus = app('directus');
        $postResponse = $directus->get('posts', $id);
        $post = $postResponse['data'];
        return view('posts.show', compact('post'));
    }
}
```

The above code fetches the blogs from the Directus backend and passes them to the posts view.

Create a `resources/views/page.blade.php` file for the page blade view and add the following code.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Posts</title>
</head>
<body>
    <h1>Blog Posts</h1>
    @foreach($posts as $post)
        <article>
            <h2><a href="{{ route('posts.show', $post['id']) }}">{{ $post['title'] }}</a></h2>
            <p>Posted on: {{ date('F j, Y', strtotime($post['date_created'])) }}</p>
        </article>
    @endforeach
</body>
</html>
```

Create another view file `resources/views/posts/show.blade.php` for the blog single page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $post['title'] }}</title>
</head>
<body>
    <h1>{{ $post['title'] }}</h1>
    <p>Posted on: {{ date('F j, Y', strtotime($post['date_created'])) }}</p>
    {!! $post['content'] !!}
    <a href="{{ route('posts.index') }}">Back to Blog</a>
</body>
</html>
```

Add the following routes to your `routes/web.php` file:

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PostController;

Route::get('/blog', [PostController::class, 'index'])->name('posts.index');
Route::get('/blog/{id}', [PostController::class, 'show'])->name('posts.show');
Route::get('/page/{slug}', [PageController::class, 'show']);
Route::get('/', [HomeController::class, 'index']);
```
Navigate to `http://127.0.0.1:8000/blog` to access the blogs page.

![blog list page](/img/37562bf0-164e-436d-a7e1-6f42ef1afe9a.webp)

## Add Navigation

Run the commmand below to create a new service provider:

```shell
php artisan make:provider ViewServiceProvider
```

Then update `app/Providers/ViewServiceProvider.php` file with the following code:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;

class ViewServiceProvider extends ServiceProvider
{
    public function boot()
    {
        $navigation = [
            ['url' => '/', 'label' => 'Home'],
            ['url' => '/blog', 'label' => 'Blog Posts'],
            ['url' => '/page/about', 'label' => 'About'],
        ];

        View::composer('*', function ($view) use ($navigation) {
            $view->with('navigation', $navigation);
        });
    }
}
```

The `ViewServiceProvider` provider service class registers an array of navigations for your application and will be used across your views to allow your users to navigate throughout the application.

Update all your views files in the **views** directory to add the navigation:

```html
<!-- put this after the <body> tag in all your views file -->
<nav>
    @foreach($navigation as $item)
        @if(isset($item['url']) && isset($item['label']))
            <a href="{{ $item['url'] }}">{{ $item['label'] }}</a>
        @else
            <p>Invalid navigation item</p>
        @endif
    @endforeach
</nav>
```

![A content page with three navigation links at the top.](/img/e55b9b9f-a74f-44d8-926e-29a274c8a41e.webp)

## Summary

Throughout this tutorial, you've learned how to build a Laravel application that uses data from a Directus project. You started by creating a new project, setting up environment variables, and everything you need to call Directus. You then created pages and post collections in Directus and integrated them with the Laravel project.
