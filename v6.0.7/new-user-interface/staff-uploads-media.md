# Staff Uploads and Media

**Uploads and media** sets the media library users upload images and files to, where uploaded files are stored, and the largest file each kind of upload accepts. It replaces the classic admin **Uploads and Media Library** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Uploads and media | `/user/staff/settings/uploads-media` | Settings |

Open it from the staff sidebar: click **Settings**, then **Uploads and media**. The classic admin no longer links to it, but the old `/app/admin/uploadsandmedialibrary/` address opens this screen. A form posted to the old address is refused and changes nothing.

The screen has one **Save upload settings** button for all three cards. Only the settings you changed are saved, and when nothing changed, saving says so and sends nothing.

::: info
Every save is recorded in the staff audit log, with the names of the settings that changed and their old and new values. The S3 secret key is never recorded: the log says only that it was replaced or removed.
:::

## Media library

- **Users can upload files to the media library**: when off, users cannot open the media library or upload to it.
- **Allowed file types**: the MIME types the media library accepts, separated by commas, for example `image/gif,image/jpeg,image/png,application/pdf`. An upload is accepted only when its type is on the list exactly. Spaces around the commas are removed when you save. See the [IANA list of media types](https://www.iana.org/assignments/media-types/media-types.xhtml).

On an install where these two were never saved, the screen shows the switch on and `image/gif,image/jpg,application/pdf,application/zip`, and the first save stores them.

## Storage

**Store uploaded media** decides where new uploads go:

| Option | What happens |
|---|---|
| **On this server** | Files are written to the `data/media` directory of the install |
| **In the database** | Files are stored in the MySQL database. Simple to back up, but the database grows with every file |
| **On Amazon S3** | Files are uploaded to an S3 bucket and served from its URL |

A change applies to new uploads only. Files already uploaded stay where they are.

### Amazon S3 connection

The connection fields appear when **On Amazon S3** is selected, and all of them are required then:

- **Access ID**: the access key ID of an IAM user that can write to the bucket.
- **Secret key**: write-only. When one is stored, the field is named **Replace secret key** and says **A secret key is stored**. The stored key is never shown. Leave the field blank to keep it, or enter a new one to replace it.
- **Remove the stored key**: shown when a key is stored. Tick it and save to clear the key. While media is stored on Amazon S3, a key is required, so removing it without entering a new one is refused. A key you type in the field wins over the box.
- **Bucket name**: the S3 bucket.
- **Media library path**: the folder in the bucket that holds the files, without a slash at the start or the end.
- **Media library URL**: the public address the files are served from, without a slash at the end. Links in emails point here.

A slash at the start or the end of the path and the URL is removed when you save.

When media is stored elsewhere but a secret key is still stored from an earlier setup, the card says so and offers **Remove the stored key**.

## Upload size limits

Each limit is a whole number of bytes. The help line under each field shows the current value in KB, MB or GB.

| Field | Applies to |
|---|---|
| **Subscriber import file** | A file uploaded to import subscribers |
| **Email attachment** | A file attached to an email |
| **Media library file** | A file uploaded to the media library |

The PHP upload limits of the server (`upload_max_filesize`, `post_max_size`) also apply, so a limit above them has no effect.

## Demo mode

In demo mode the screen shows media stored on the server and no S3 connection, and saving is not available.
