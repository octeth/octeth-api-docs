# Media Library

The **Media library** holds the images and files you use in your emails. Upload a file once and insert it into any email from the editor.

| Screen | Path on a default install | Permission |
|---|---|---|
| Media library | `/user/media-library` | The account's user group must include the media permissions. A team member needs a role that edits content to upload, and one that deletes content to delete |

Open it from the sidebar, under **Content**.

## Upload files

1. Open the folder the files should go to, or stay in **All files**.
2. Drop files on the upload zone, or click it and choose them.

The zone shows the file types and the size the platform accepts. A file that is too large is refused before it is sent. When a file is refused, a message names it, and the other files are still uploaded. The type is read from the file itself, so renaming a file does not change it.

## Folders

Click **New folder** to create a folder inside the one you are viewing. Click a folder to open it, and use the path above the files to go back.

## Use an image in an email

In any Custom HTML editor (campaigns, templates, auto responders and the list confirmation email):

- **Visual mode**: click the image button in the toolbar, then **Upload an image** or **Browse media library**. You can still enter a web address.
- **HTML mode**: click **Insert image** above the editor. The image tag goes in at the cursor.

## Copy or delete a file

Open the menu on a file and choose **Copy address** or **Delete**. Deleting a folder deletes everything in it.

::: warning
Emails that use a deleted image, including emails already sent, show it as missing. Deleting cannot be undone.
:::

## Where images are served from

When your sender domain is verified and its tracking host works, images in sent mail are served from that host, so they match your From domain. Otherwise they are served from the platform's own tracking host or address. You do not change anything in your email: the address is replaced when the email is sent.

Image addresses are public, as images in email must be. Anyone with the address can open the file. Loading an image never counts as an open.
