---
id: d204a3d5-d674-4a21-862e-6c9c8ac82ab3
slug: preview-files-in-live-preview-with-google-docs-previews
title: Preview Files in Live Preview with Google Docs Previews
authors:
  - name: Alex van der Valk
    title: Sales Engineer
description: Learn how to use Google Gview to preview many file formats in Directus Editor.
---
Using the file interface, you can store all types of files inside items in your Directus projects. However, there is no built-in way to preview files directly in the editor. I found an easy and reliable way to do this using Directus' Live Preview feature and Google Gview to preview many file formats without first having to download each file.

1. In your collection, create a **File** field. I recommend specifying a specific folder for the uploads here, because it can help keep your assets organized.
2. Ensure you have a static access token with a user who has permission to view your folder of files.
3. In your Collection configuration, scroll down to the **Preview** section.
4. In the **Preview URL** field add the following, replacing `YOUR_DIRECTUS_URL` with the URL for your Directus Project, and `TOKEN` with your static token.
	```
    https://docs.google.com/gview?embedded=true&url=YOUR_DIRECTUS_URL/assets/?access_token=TOKEN
    ```
5. Using the variable tool in the **Preview URL** interface, add in the image `ID` just before the `?` character in the URL.

![Using the plus button to the right of the text box presents all fields within the candidate collection. Select ID with the cursor positioned just before the question mark.](/img/d4018c0d-65e1-42f7-a957-660069934abc.webp)

Open up a record in your collection and select the **Live Preview** button in the top-right. Now you can preview the file inside Directus without having to download it first!

![Directus Editor with a form on the left and a Doc X file being previewed on the right.](/img/a5aba0b0-c254-41d5-987d-78859077604b.webp)
