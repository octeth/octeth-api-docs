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

On an install where these two were never saved, the screen shows the switch on and `image/gif,image/jpeg,image/png,image/webp,application/pdf,application/zip`, and the first save stores them.

## Storage

**Store uploaded media** decides where new uploads go:

| Option | What happens |
|---|---|
| **On this server** | Files are written to the `data/media` directory of the install |
| **In the database** | Files are stored in the MySQL database. Simple to back up, but the database grows with every file |
| **In S3-compatible storage** | Files are uploaded to a bucket on Amazon S3, Cloudflare R2, MinIO, Wasabi or another service with an S3 API. The bucket can stay private: this install serves the files |

A change applies to new uploads only. Files already uploaded stay where they are.

### S3-compatible connection

The connection fields appear when **In S3-compatible storage** is selected:

- **Endpoint**: the service's S3 API address, the host only. Leave it empty for Amazon S3.
- **Region**: the bucket's region. For Amazon S3 it is looked up when empty.
- **Bucket name** and **Path in the bucket**: where the files go. The path has no slash at the start or the end. Changing the endpoint, bucket or path does not move files already stored, so copy them under the same path first.
- **Access key ID**: a key that can read, write and delete objects in the bucket.
- **Secret key**: write-only. When one is stored, the field is named **Replace secret key** and says **A secret key is stored**. The stored key is never shown. Leave the field blank to keep it, or enter a new one to replace it.
- **Remove the stored key**: shown when a key is stored. Tick it and save to clear the key. While media is stored in S3-compatible storage, a key is required, so removing it without entering a new one is refused. A key you type in the field wins over the box.
- **Path-style addresses**: put the bucket in the path instead of the host name.
- **Earlier public address**: only for files uploaded before v6.0.8, which were public. If the bucket does not hold one, it is read from this address. Keep it when you move to another service, or leave it empty.

| Service | Endpoint | Region | Path-style addresses |
|---|---|---|---|
| Amazon S3 | empty | the bucket's region, or empty | Off |
| Cloudflare R2 | `https://ACCOUNT_ID.r2.cloudflarestorage.com` | `auto` | Off or on |
| MinIO | your server's address, for example `https://minio.example.com` | `us-east-1` unless you changed it | On |
| Wasabi | `https://s3.REGION.wasabisys.com` | the same region | Off |

**Test connection** writes a small test object, reads it back and deletes it, with what the form holds. Nothing is saved. When it fails, the message names the step and the service's own error.

When media is stored elsewhere but a secret key is still stored from an earlier setup, the card says so and offers **Remove the stored key**.

### How files are served

Every media file is served by this install, whatever stores it, with headers that let mail providers' image proxies keep it for a year. In sent mail, image addresses move to the sender domain's tracking host. A file in S3-compatible storage is read from the bucket for every request a proxy has not cached, so plan the bandwidth of the application server: a campaign to one million recipients with a 200 KB image is up to 200 GB.

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
