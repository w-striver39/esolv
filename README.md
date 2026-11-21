# GlobalEcomPro - Hero & Header Section

A pixel-accurate, high-performance, and 100% mobile/tablet-responsive hero section and header inspired by modern global e-commerce agency designs.

---

## 🔗 Live Preview Links

You can preview the project in your browser using either of these links:

- **Local Web Server**: [http://localhost:3000](http://localhost:3000) (Active background server)
- **Direct Local File**: [file:///c:/Users/hp/Downloads/Esolv/index.html](file:///c:/Users/hp/Downloads/Esolv/index.html)

---

## 📁 Complete Project Structure

```
Esolv/
├── index.html                    # Main HTML5 markup & semantic structure
├── server.js                     # Lightweight zero-dependency preview server
├── css/
│   └── style.css                 # 100% responsive styling, design tokens & animations
├── js/
│   └── main.js                   # Interactive logic (counter animations, drawer, search modal)
├── assets/
│   ├── logo.svg                  # GlobalEcomPro vector logo (placeholder for your brand)
│   ├── favicon.svg               # Vector browser favicon
│   ├── images/                   # Directory reserved for custom images
│   └── icons/                    # Directory reserved for custom icons
├── backups/
│   ├── latest_snapshot/          # Uncompressed latest project snapshot
│   └── backup_esolv_*.zip        # Timestamped zip archives for instant restore
├── scripts/
│   ├── backup.ps1                # PowerShell script for automated timestamped backups
│   ├── backup.bat                # 1-Click double-click backup runner for Windows Explorer
│   └── start-server.bat          # 1-Click runner to start the server and open browser
└── README.md                     # Comprehensive project documentation
```

---

## 🛡️ Automatic Backup System

This project is equipped with an integrated automated backup system:

1. **Automatic Backup Script**:
   - Double-click `scripts/backup.bat` or run `scripts/backup.ps1` in PowerShell at any time.
   - It automatically generates a timestamped `.zip` archive in the `backups/` folder (e.g. `backup_esolv_YYYYMMDD_HHMMSS.zip`).
   - It also updates `backups/latest_snapshot/` with a mirror of the latest code.
2. **Current Initial Backup Available**:
   - `backups/backup_esolv_20261117_163636.zip`
   - `backups/latest_snapshot/`

---

## 🎨 How to Swap Your Logo & Favicon Later

When your official brand assets are ready:
1. **Logo**: Place your logo inside `assets/` (e.g. `assets/logo.svg` or `assets/logo.png`). Update line 31 in `index.html` if the filename differs.
2. **Favicon**: Place your favicon in `assets/favicon.svg` (or `assets/favicon.ico`). Update line 9 in `index.html`.
