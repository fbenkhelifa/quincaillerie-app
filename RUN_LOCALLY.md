Local run and bootstrap
======================

Quick steps to get the app running locally (Windows / PowerShell). The project includes a helper script:

1) Run the setup script (recommended). This will copy a local .env, create a sqlite DB file and install dependencies:

```powershell
.\scripts\setup-local.ps1 -MoveBackupOut
```

- `-MoveBackupOut` will move any `.env.local.backup` found in the project root to a safe folder in your user profile:
  `%USERPROFILE%\quincaillerie-app-env-backups`.

2) Start the server:

```powershell
php artisan serve
```

3) Frontend development (if you need hot reload):

```powershell
npm run dev
```

Notes
- The helper uses SQLite for local development so you don't need to run MySQL/MariaDB.
- If you prefer to use your own database, copy `.env.example` and update the DB_* variables accordingly.
- Do NOT commit your `.env` or any backups containing secrets.
