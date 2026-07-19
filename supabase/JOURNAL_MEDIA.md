# Journal media storage

Migration `20260718130934_journal_article_v1_schema.sql` provisions two buckets:

- `journal-media` is public and contains only published assets.
- `journal-drafts` is private and contains draft uploads.

A folder prefix cannot make an object private inside a public Supabase bucket.
The publishing service must therefore copy or move an approved draft object to
`journal-media`, update `journal_media.bucket_id`, `object_path`, and
`visibility`, then remove the draft object.

Browser clients receive read-only access to published objects and metadata.
Uploads, replacements, promotion, and deletion must go through a server-side
service-role client. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

The migration limits both buckets to 10 MiB image files (JPEG, PNG, WebP, AVIF,
or GIF). Update the migration deliberately if additional formats are required.
