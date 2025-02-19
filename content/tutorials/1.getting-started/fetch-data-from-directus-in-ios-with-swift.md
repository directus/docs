---
id: fbb96512-b46a-4a0c-bb39-b7d11ec0dc7f
slug: fetch-data-from-directus-in-ios-with-swift
title: Fetch Data from Directus in iOS with Swift
authors:
  - name: Harshpal Bhirth
    title: Guest Author
description: Learn how to integrate Directus in your iOS app with Swift.
---
In this tutorial, you will learn how to configure an iOS project to fetch and showcase posts in your SwiftUI-based app.

## Before You Start

You will need:

1. To have Xcode installed on your macOS machine.
2. Knowledge of the Swift programming language.
3. A Directus project - follow our [quickstart guide](/getting-started/overview) if you don't already have one.

## Create Post Structs and Helpers

Create a new file in your Xcode project and name it `Post.swift` you can do this by:

1. Right-click on the project navigator in the root of the project.
2. Choose "New File..." from the context menu.
3. In the template chooser, select "Swift File" under the "Source" section.
4. Name the file as "Post.swift".
5. Click "Create."

In the `Post.swift` file, create a Swift `struct` named `Post` to represent the data structure of the posts you'll be fetching from the Directus API. This `struct` should conform to the `Codable` and `Identifiable` protocols.

```swift
struct Post: Codable, Identifiable {
    var id: Int
    var title: String
    var content: String
    var status: String
    var image: String?
}
```
Below the` image` variable, create an `imageURL` computed property to calculates the image URL by appending the image UUID to the base URL of your Directus instance's assets:

```swift
var imageURL: String? {
    guard let imageUUID = image else { return nil }
    return "https://directus-project-url/assets/\(imageUUID)"
}
```

Finally, create a `stripHTML()` function to remove any HTML markup and leaving only the text content:

```swift
func stripHTML() -> String {
    return content.replacingOccurrences(of: "<[^>]+>", with: "", options: .regularExpression, range: nil)
}
```

## Create a ContentView

Create a `ContentView.swift` file if you haven't got one already you can do this by:

1. Right-click on the project navigator in the root of the project.
2. Choose "New File...".
3. Select "SwiftUI View" and name it "ContentView.swift".
4. Click "Create".

`ContentView` is a SwiftUI view that serves as the main interface for displaying a list of posts. Users can interact with individual posts, view truncated content, and access detailed information about a selected post. The view leverages SwiftUI's navigation and sheet presentation capabilities to create a consistent user experience.

![App screenshot showing three posts - each with a title and a description](https://marketing.directus.app/assets/b1b92c40-0ffb-4d00-9b90-5d952d4321cd)

In your `ConentView.swift` file add the following two properties:

```swift
struct ContentView: View {
    @State private var posts = [Post]() // [!code ++]
    @State private var selectedPost: Post? = nil // [!code ++]
}
```

- `@State private var posts = [Post]()` is state property holding an array of `Post` objects. The `@State` property wrapper indicates that the value can be modified and that changes to it should trigger a re-render of the corresponding view.
- `@State private var selectedPost: Post? = nil` is a state property that represents the currently selected `Post` object. It is initially set to `nil` because no post is selected at launch.

Add a `body`:

```swift
var body: some View {
	NavigationView {
		VStack(alignment: .leading) {
			List(posts) { post in
				VStack(alignment: .leading) {
					Text(post.title)
						.font(.headline)
					Text(post.stripHTML().prefix(100) + "...")
						.font(.body)
						.onTapGesture {
							selectedPost = post
						}
				}
			}
			.sheet(item: $selectedPost) { post in
				PostDetailView(selectedPost: $selectedPost, fetchPost: postAPIcall)
			}
		}
		.navigationTitle("Posts")
		.task {
			await fetchPosts()
		}
	}
}
```

The `body` property is the main content of the view. In SwiftUI, views are constructed by combining smaller views:

1. `NavigationView`: Wraps the entire content and provides a navigation interface.
2. `VStack`: A vertical stack that arranges its children views in a vertical line.
3. `List(posts) { post in ... }`: Creates a list of `Post` objects, where each post is represented by a vertical stack containing the post's title and a truncated version of its content.
4. Inside the list, a `Text` view displays the post's title, and another `Text` view displays a truncated version of the post's content. `onTapGesture` is used to detect when a user taps on a post, setting the `selectedPost` property to the tapped post.

The `.navigationTitle()` method in a `NavigationView` sets the title of the navigation bar, and the `task` fetches posts asynchronously when the view is first loaded.

## Fetch Posts List

I na previous step, you have called the `fetchPosts()` function, and now it's time to implement it. The function will get data from a remote API, decode the JSON response, and update the `@State` property `posts` with the retrieved data. Any errors encountered during this process are printed to the console.

Inside `ContentView.swift`, add the following function:

```swift
func fetchPosts() async {
	guard let url = URL(string: "https://ios-author-demo.directus.app/items/posts") else {
		print("Invalid URL")
		return
	}

	do {
		let (data, _) = try await URLSession.shared.data(from: url)
		let decoder = JSONDecoder()
		let result = try decoder.decode([String: [Post]].self, from: data)

		if let posts = result["data"] {
			self.posts = posts
		}
	} catch {
		print("Error: \(error)")
	}
}
```

## Fetch a Single Post

When the user clicks a post in the list, a new request will be made to fetch details of a specific post. If successful, the `selectedPost` property is updated with the retrieved post details:

```swift
func postAPIcall(postId: Int) async {
	let uuid = UUID().uuidString
	var components = URLComponents(
		string: "https://directus-project-url/items/posts/\(postId)")!
	components.queryItems = [URLQueryItem(name: "uuid", value: uuid)]

	guard let url = components.url else {
		print("Invalid URL")
		return
	}

	do {
		let (data, _) = try await URLSession.shared.data(from: url)
		let decoder = JSONDecoder()

		struct ApiResponse: Decodable {
			let data: Post
		}

		let result = try decoder.decode(ApiResponse.self, from: data)

		selectedPost = result.data
	} catch {
		print("Error: \(error)")

	}
}
```

## Display a Single Post

This SwiftUI view is designed to present detailed information about a selected post. It includes the post title, image (if available), content, a dismiss button to clear the selected post, and the post status.

Create a new `PostDetailView.swift` file and add the following code:

```swift
import SwiftUI

struct PostDetailView: View {
	@Binding var selectedPost: Post?
	var fetchPost: (Int) async -> Void
	var body: some View {
		if let post = selectedPost {
			VStack {
				Text(post.title)
					.font(.headline)
					.padding()

				if let imageURL = post.imageURL {
					AsyncImage(url: URL(string: imageURL)) { phase in
						switch phase {
						case .success(let image):
							image
								.resizable()
								.aspectRatio(contentMode: .fit)
								.frame(maxHeight: 200)
						case .failure(_):
							Text("Failed to load image")
						case .empty:
							Image(systemName: "photo")
								.resizable()
								.aspectRatio(contentMode: .fit)
								.frame(maxHeight: 200)
								.foregroundColor(.gray)
						default:
							EmptyView()
						}
					}
					.padding()
				}

				Text(post.stripHTML())
					.font(.body)
					.padding()

				Spacer()

				Button("Dismiss") {
					selectedPost = nil
				}

				Text("Status: \(post.status)")
					.font(.subheadline)
					.foregroundColor(.gray)
					.padding()
			}
			.task {
				await fetchPost(post.id)
			}
		}
	}
}
```

After checking that `selectedPost` has a value, various values are rendered to the view. `AsyncImage` asynchronously loads and displays the post image, handling different loading phases and displaying a placeholder or an error message if necessary. The `Button` clears the `selectedPost` which hides the view.

Take note that the `fetchPost` function is also run with the ID of the post. During this request, you can ask or more data and only load what's absolutely needed in the list view.

## Summary

By following this tutorial, you've learned to integrate Directus API calls into a SwiftUI iOS app. You have loaded a list of data, and implemented a post detail view which asynchronously displays an image and further post information.
