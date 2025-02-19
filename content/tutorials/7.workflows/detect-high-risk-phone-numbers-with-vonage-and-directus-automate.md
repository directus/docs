---
id: 6388aa8a-99b5-4a3b-a9ff-275d26b8cb81
slug: detect-high-risk-phone-numbers-with-vonage-and-directus-automate
title: Detect High-Risk Phone Numbers with Vonage and Directus Automate
authors:
  - name: Kevin Lewis
    title: Director, Developer Experience
description: Learn how to integrate Vonage's Number Insights API with Directus Automate to validate numbers.
---
When creating new users for your service, it's important to take steps to prevent fraudulent or malicious activity. In this post, you'll use [Vonage's Number Insight V2 API](https://developer.vonage.com/en/number-insight/number-insight-v2/overview) and [Directus Automate](https://directus.io/toolkit/automate) to determine the likelihood of a number being risky at the time of user registration, and let you act on it.

The Vonage Number Insight V2 API assigns a fraud score to numbers, along with a risk recommendation - allow, flag, or block. You can use this recommendation to allow user creation, allow it with a note to your team to validate or block creation.

## Before You Start

You will need a Directus project - check out [our quickstart guide](/getting-started/overview) if you don't already have one. You will also need a [Vonage Developer API account](https://developer.vonage.com/sign-up), taking note of your API Key and Secret. You should also have a high-risk number to test with (I used the last spam caller I had).

Finally, in Your Directus project, add an input field called `phone_number` to the `directus_users` collection. This is a system collection, so you will need to expand them in the Data Model settings in order to see the `directus_users` collection.

## Set Up Trigger

Create a new Flow from your Directus project settings - call it "Check Phone Fraud Risk". Create an **Event Hook** trigger that is Blocking - this means the flow will run before the data is entered in the database. Set the Scope to `items.create` on the `directus_users` collection - this means the flow will start whenever a new user is created.

![A Flow showing the Event Hook trigger with a Filter/Blocking type, items dot create scope, and only the Directus Users collection checked. ](/img/94d67356-cad8-416c-9a0f-64526a56b9af.webp)

## Set Up Number Insight Check

When authenticating your Vonage API call, you must provide your API Key and Secret Base64-encoded. Find an online encoder, and encode the following `your_key:your_secret` (the colon is important). Take note of the encoded string.

Create a **Webhook / Request URL** operation and set the Key to `check_number`. Setting the key inserts the data into the Flow's data chain using this property name. Set the Method to POST and the URL to `[https://api.nexmo.com/v2/ni](https://api.nexmo.com/v2/ni)`.

Set one header:

```
Authorization: Basic BASE_64_ENCODED_AUTH_STRING
```

In the body, send the following JSON:

```json
{
   "type": "phone",
   "phone": "{{$trigger.payload.phone_number}}",
   "insights": ["fraud_score"]
}
```

Navigate to the Users Module in the module bar and create a new user. You can leave all information blank apart from the phone number - [make sure it's in E.164 format](https://developer.vonage.com/en/voice/voice-api/concepts/numbers).

Come back to your flow and open the logs in the sidebar. You can see the operation outputs an object containing a `fraud_score` and related information. The `risk_score` is a scale of 0 to 100. This project will use the `risk_recommendation` value of `allow`, `flag`, or `block` in future steps.

![Sidebar open with the Webhook / Request URL Payload expanded. A large object is shown with a data object containing a fraud_score object.](/img/4cb62154-f51a-4535-b5c8-7a00d5e69dde.webp)

## Set Up Conditionals For Fraud Recommendation Result

From the resolved path of the API request, create a **Condition** operation with the following rule:

```json
{
    "check_number": {
        "data": {
            "fraud_score": {
                "risk_recommendation": {
                    "_eq": "allow"
                }
            }
        }
    }
}
```

The resolved path will be followed if the `risk_recommendation` is `allow`. If a flow ends on a resolved path, the Blocking Flow will end and the item will be added to the collection.

The reject path will be followed if the value is anything else. From the reject path, create another **Condition** operation to determine whether the recommendation is `flag` or `block`:

```json
{
    "check_number": {
        "data": {
            "fraud_score": {
                "risk_recommendation": {
                    "_eq": "flag"
                }
            }
        }
    }
}
```

The resolved path will be `flag`, and the reject path will be `block`.

The flow now looks like this:

![A flow has one trigger and three operations. The first operation makes a request to a Vonage API. The second is a conditional called Is Allowed, and from the reject path, another conditional called Is Flagged.](/img/5e02b984-16fd-4f21-90ff-6429b1b49cda.webp)

## Send Emails If Flagged or Blocked

In this tutorial, a flagged user will still be created, but an email will be sent to an internal team member to perform manual validation. From the resolved path of **Is Flagged** create a **Send Email** operation. Add an email address, and inject dynamic values in the Subject and Body:

```
— Subject —

Flagged Phone Number from {{$trigger.payload.first_name}} {{$trigger.payload.last_name}}

— Body —

The phone number {{$trigger.payload.phone_number}} was flagged by the Vonage Number Insight system with a score of {{check_number.data.fraud_score.risk_score}}.

Please manually validate this user's profile before approving their jobs.
```

## Reject New User Item If Blocked

From the reject path of **Is Flagged** create a **Send Email** operation. Form a rejection message and send it to the user who tried to register using `{{$trigger.payload.email}}` as the recipient.

When a Blocking Flow concludes, data is entered into the database. Currently, there is no elegant way to stop this, but there is a reliable way to make this happen. After the email operation that sends the rejection, create a **Run Script** operation from the resolved path:

```js
throw new Error('Phone number failed fraud checks');
```

This will cause the Flow to fail and not enter the item into the `directus_users` collection.

Your final flow should look like this:

![After the Is Flagged operation, the resolved path sends an email and the reject path sends an email and then runs a script.](/img/0d92e88d-ca4d-4525-907e-9f7c126ce3dc.webp)

## Summary

In this post, you have learned how to use the Vonage Number Insight V2 API to check a phone number for the likelihood of fraud at the time of new user registration. Based on the outcome, users are created, flagged, or blocked from being created.

Based on the `allow`, `flag`, or `block` recommendation, you can add any operations from those provided by Directus, or through [building your own](/guides/extensions/api-extensions/operations).

If you have any questions, please feel free to [join our Discord server](https://directus.chat) and ask them.
