---
id: 0a7a8969-138e-4047-884e-1048a811a939
slug: build-directus-garden-a-passive-collaborative-event-booth-demo
title: Build Directus Garden - A Passive Collaborative Event Booth Demo
authors:
  - name: Kevin Lewis
    title: Director, Developer Experience
description: Learn how we built our engagement platform for live in-person events with P5.js.
---
For the last ten years I’ve been running and sponsoring events for developers, and as part of that I’ve become [rather opinionated](https://www.youtube.com/watch?v=OEmV4jOKk34) about what it takes to build a logistically-sound and engaging booth (often a table with a TV in a networking hall).

The team at Directus are proud sponsors of VueJS Amsterdam, and I had the pleasure of building a booth demo that highlights what makes our Composable CMS great.

## What Must It Do?

One of my favorite iOS games — [Neko Atsume](https://www.nekoatsume.com/en/) — does not vie for your attention and is remarkably laid back. As well as being super cute, it’s an app you open at your leisure to tend to your yard and see which kittens have chosen to grace you with their presence.

![Neo Astume Kitty Collector. A set of cute cats are playing on some decking.](/img/201d06a8-5667-4cc4-b7fc-e3fe77c29703.webp)

This is a perfect vibe — passive, laid-back, and incredibly cute. With this in mind, as well as real business needs, here were the requirements:

1. Must have attendees touch Directus as a product in some way.
2. Must be passive: we don’t want to ‘manage’ the demo live - we want to be having conversations with developers.
3. Must be collaborative instead of competitive. This is very much our vibe, and wanted it to extend through our demo.
4. Must provide an opt-in way for attendees to hear from us after the event.

## Introducing Directus Garden

![A cartoon garden has several birds, bunnies, and other decroative items placed in it.](/img/4abfb5f8-aacf-414a-bdb3-083de8f73c33.webp)

In this small demo built in a day, attendees become gardeners helping us build a beautiful and lively garden by placing items in the scene.

To do this, they must use Directus Auth to register for and login to their account, and then Directus Connect to see what they can place before doing so.

The client is a Nuxt.js application backed with Directus, and can facilitate multiple ongoing events. Once audience members participate, they are invited back at the final break for a raffle draw via a transactional email sent through Directus Automate.

## Understanding the Project

Participants are expected to hit 4 API endpoints to enter the raffle:

1. Register, providing a name, email, and an optional contact opt-in.
2. Login to receive an auth token.
3. List all items that can be placed.
4. Place an item at a specific coordinate.

Once an item is placed, the garden display on the TV behind our table will automatically show the new item using Directus Realtime, along with newly-placed item showing in the “gardener’s log”.

At the end of the event, we want to select a winner from the list of users who participated.

## Setting Up Collections

There are three user collections in this project:

1. **Events** - events are instances of the demo. They contain all of the event-specific information like name, date, and raffle information.
2. **Placeables** - items that can be placed, like muffin the rabbit or sky the bird. Each has an image, name, and category.
3. **Place** - one entry into the raffle. It stores the event, placeable, coordinates, and the user which created it. It is singular to form a nicer user-facing URL as part of the demo (`POST /items/place`).

The `directus_users` system collection is also given a `contact_opt_in` boolean field.

## Setting Up Roles

A new **Gardener** role is created for participants. It is given read access on the `placeables` collection, and create access on the `place` collection.

The **Display** role is created for the screen showing the garden. It has read access over all user-created collections, and access to the `first_name` of `directus_users` (so they can be displayed on the screen).

The **Public** role is given access on the `events` and `placeables` collection.

![The public Directus Users create permissions allows access to only the name, email, password, and contact fields. The field validation requires name, email, and password to not be empty.](/img/a987fc90-c4b2-4148-8f26-d483ebec8fbd.webp)

Before users register, their API requests will be made with the permissions of the Public role. The role’s create permissions for the `directus_users` collection only allow for them to touch five fields, and requires that all required fields are not empty.

![The field presets configure the role to a hardcoded ID for the gardener role](/img/37b1084a-ff46-43e8-891b-dd54acd24e2b.webp)

Then, using Field Presets, all new users created with the public role are automatically given the Gardener role - a field that the Public role can not set.

## Building the Participation Form

In the original design, attendees would effectively be given an API reference and were expected to make the calls in a HTTP client of their choice. However, this unnecessarily increased the barrier to entry not just technically, but requiring attendees to have a device capable of sending 4 requests, some with a JSON body and with headers. It was too much!

Using the [`simple-code-editor`](https://simple-code-editor.vicuxd.com/) Vue 3 component, a page is created on a per-event basis that would allow these requests to be made. When a user successfully registers, it automatically populates the next request’s body. When they log in, we populate the Authorization header, and so on. The final request even picks a random placeable and coordinate set as default, to make participation really easy.

![Four HTTP requests shown in code editors, and 4 empty repsonses. Each box has a button under it to make the request. The steps are: register a user, login, list placeables, and place item.](/img/cd311e29-83a4-43f2-a225-09755af282e8.webp)

Taking part in our raffle shouldn’t be a test of technical skill - it should be a chance to educate users about what Directus is and show it off in it’s best light. You don’t do that if attendees are frustrated.

These code editors make real requests and display real results (and errors) when they are returned.

## Sending Confirmation Email

Using Directus Flows, a confirmation email is sent as soon as a new item is placed. In the flow, we retrieve the associated event and user information, and then send an email with dynamic variables that contain raffle information as well as some other interesting links to read.

![A flow with four steps -an items create event hook on the place collection, read data on the directus users collection, read data on the events collection, and send email.](/img/5b537af3-471c-42c9-bb5d-5d1a3cbadb0b.webp)

## Building the Garden Display

The display is primarily built using [P5.js](https://p5js.org) - a library to make working with the HTML5 Canvas easier. Once the page loads, we preload all of the placeable images into memory before the canvas is rendered. A `places` `ref` is created to contain all items that should be shown in the canvas:

```js
const placeablesData = await directus.request(
  readItems('placeables', {
    fields: ['*', {
      'image': ['id', 'width', 'height']
    }]
  })
)
const placeables = ref([])
const places = ref([])

p5.preload = () => {
  background.value = p5.loadImage(asset('image-id-from-directus'))
  for (const p of placeablesData) {
    placeables.value.push({
      image: p5.loadImage(asset(p.image.id)),
      name: p.name,
      aspect: p.image.width / p.image.height
    })
  }
}
```

### Using Directus Realtime

When subscribing to a collection with existing items, a subscription `init` message will be sent in response with current items in the collection. We can use this to add the initial items to the `places` variable, and then add new items when they are created:

```js
onMounted(() => {
  const connection = new WebSocket(wsBase)

  connection.addEventListener('open', () => {
    connection.send(JSON.stringify({
      type: 'auth',
      access_token: 'public-role-user-token'
    }))
  })

  connection.addEventListener('message', (message) => {
    const data = JSON.parse(message.data)

    if (data.type == 'auth' && data.status == 'ok') {
      connection.send(JSON.stringify({
        type: 'subscribe',
        collection: 'place',
        query: {
          fields: ['*', 'user_created.first_name'],
          filter: { event: { _eq: route.params.event } }
        }
      }))
    }
    if (data.type == 'subscription' && data.event == 'init') {
      places.value = data.data
    }

    if (data.type == 'subscription' && data.event == 'create') {
      places.value.unshift(data.data[0])
    }

    if (data.type == 'ping') {
      connection.send(JSON.stringify({
        type: 'pong'
      }))
    }
  })
})
```

The logic to automatically show existing and new items.

### Drawing Placed Items

Back in the P5 sketch, we loop over all items that are in the array and draw them. If the user is hovering over them, we show who the item’s gardener was:

```js
p5.draw = () => {
  p5.background(background.value)
  for (let place of places.value) {
		// Draw item
    const placeable = placeables.value.find(p => p.name == place.name)
    const x = parseInt(place.x_pos), y = parseInt(place.y_pos)
    p5.image(placeable.image, x, y, 100 * placeable.aspect, 100)

		// Draw gardener name on hover
    const mouseInBoundsX = p5.mouseX > x && p5.mouseX < x + (100 * placeable.aspect)
    const mouseInBoundsY = p5.mouseY > y && p5.mouseY < y + 100
    if (mouseInBoundsX && mouseInBoundsY) {
      p5.stroke('black')
      p5.text(`${placeable.name} by ${place.user_created.first_name}`, p5.mouseX, p5.mouseY)
      p5.noStroke()
    }
  }
}
```

P5 will redraw this sketch about 60 times a second, so the moment there are new items added via Directus Realtime, they are rendered in the subsequent draw.

To help users place their item in the garden, the P5 sketch also places rulers along the length and height of the screen. These can be toggled, along with the information box, to get a clear view of the garden.

## Raffle Draw

The raffle isn’t worth writing much about - we require admin authentication and fetch all placed items. We then client-side dedupe if gardeners were extra enthusiastic and placed multiple items, and then pick a winner at random from the deduped array.

## We Hope You Enjoy!

This is a small demo which highlights both the APIs generated by Directus, authentication endpoints, and Realtime capabilities. It aims to be a nice, chill, collaborative experience, and we hope you enjoy taking part.

🧑‍🌾🍃🌻
