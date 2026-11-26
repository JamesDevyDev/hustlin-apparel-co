# Admin authentication setup

Set `ADMIN_INITIAL_PASSWORD` in the server environment before deploying/restarting the app for the first time. Use a strong password of at least 12 characters. On the first database schema initialization, the app hashes this value with Node.js scrypt and stores only the hash in `store_settings` under `admin_password`. The environment variable is only used to initialize the password when that database key does not already exist; changing the variable later does not overwrite the stored password.

Open `/admin` and sign in at `/admin-login`. Admin pages and admin-only API operations require the HTTP-only, SameSite=Strict session cookie. Sessions expire after 8 hours. Changing the password revokes all existing admin sessions and requires signing in again.

Do not expose `ADMIN_INITIAL_PASSWORD` to client-side environment variables or commit it to source control. Keep the application behind HTTPS in production.
