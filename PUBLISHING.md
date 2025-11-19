# Publishing Guide

## ✅ Completed Setup

### 1. ✅ Cleaned Up Project
- Removed old `src/`, `public/`, `dist/` folders from root
- Removed unused config files
- Removed duplicate `DemoLandingPage.tsx`
- Clean monorepo structure with `packages/core` and `demo`

### 2. ✅ Package Ready for NPM
- **Location**: `packages/core/`
- **Built**: ✅ Distribution files in `packages/core/dist/`
- **README**: ✅ Comprehensive documentation
- **package.json**: ✅ Updated with proper metadata

### 3. ✅ Demo Ready for GitHub Pages
- **Location**: `demo/`
- **Built**: ✅ Static files in `demo/dist/`
- **Base URL**: Set to `/type-ahead-mention/`
- **GitHub Actions**: ✅ Workflow created at `.github/workflows/deploy.yml`

---

## 📦 Publishing to NPM

### First Time Setup (if not already done)

```bash
# Login to NPM
npm login
```

### Publish the Package

```bash
cd /home/ubuntu/code/personal/type-ahead-mention

# Publish the package (it will auto-build via prepublishOnly)
npm publish --workspace=@type-ahead-mention/core --access public
```

### Update Version for Future Releases

```bash
cd packages/core

# Bump version (patch/minor/major)
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Then publish from root
cd ../..
npm publish --workspace=@type-ahead-mention/core
```

---

## 🚀 Deploying Demo to GitHub Pages

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/rahulpatwa1303/type-ahead-mention
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select **GitHub Actions**
4. Save

### Step 2: Push to GitHub

```bash
cd /home/ubuntu/code/personal/type-ahead-mention

# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "feat: prepare for NPM publication and GitHub Pages deployment

- Added comprehensive README for package
- Set up GitHub Actions workflow for demo deployment
- Cleaned up project structure
- Added array support to autocomplete
- Built library and demo"

# Push to master
git push origin master
```

### Step 3: Verify Deployment

After pushing:
1. Go to **Actions** tab in your GitHub repo
2. Watch the "Deploy Demo to GitHub Pages" workflow run
3. Once completed, visit: https://rahulpatwa1303.github.io/type-ahead-mention/

---

## 🎯 Project Structure

```
type-ahead-mention/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions for demo deployment
├── packages/
│   └── core/                   # NPM Package
│       ├── src/                # Source code
│       ├── dist/               # Built files (UMD + ES modules + types)
│       ├── package.json        # Package metadata
│       ├── README.md          # Package documentation
│       ├── vite.config.ts     # Build configuration
│       └── tsconfig.json      # TypeScript config
├── demo/                       # Demo Site
│   ├── src/
│   │   ├── App.tsx           # Main demo component
│   │   ├── DemoLandingPage.css
│   │   └── main.tsx
│   ├── dist/                  # Built demo (for GitHub Pages)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts        # Demo build config (with base: '/type-ahead-mention/')
│   └── tsconfig.json
├── package.json               # Workspace root
├── package-lock.json
├── tsconfig.json
├── .gitignore
└── README.md                  # Project overview

```

---

## 📝 Quick Commands Reference

```bash
# Development
npm run dev:demo              # Run demo locally at localhost:5173

# Build
npm run build:lib            # Build the NPM package
npm run build:demo           # Build the demo site
npm run build                # Build both

# Publish
npm publish --workspace=@type-ahead-mention/core --access public
```

---

## 🔗 Important Links

- **Repository**: https://github.com/rahulpatwa1303/type-ahead-mention
- **Demo** (after deployment): https://rahulpatwa1303.github.io/type-ahead-mention/
- **NPM Package**: https://www.npmjs.com/package/@type-ahead-mention/core

---

## ✨ Features in the Demo

The live demo showcases:
- ✅ 5 theme presets (Light, Dark, Ocean, Sunset, Forest)
- ✅ Real-time style customization (font, border, padding, etc.)
- ✅ Live JSON editor for suggestions data
- ✅ Interactive tree visualization of data structure
- ✅ Template resolution examples
- ✅ Support for nested objects: `{{user.address.city}}`
- ✅ Support for arrays: `{{user.roles.0}}`
- ✅ Support for array objects: `{{order.items.0.name}}`

---

## 📄 License

MIT © Rahul Patwa
