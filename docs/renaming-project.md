# How to Rename This Project

This guide explains how to rename the "obsidian-modal-form" project (also known as "Modal forms" in Obsidian) to a new name.

## Important Considerations

Before renaming the project, consider the following:

1. **Plugin ID Change Impact**: Changing the plugin ID (`modalforms`) will break existing installations. Users will need to reinstall the plugin and reconfigure their settings.
2. **API References**: Any code that references `app.plugins.plugins.modalforms.api` will need to be updated.
3. **Obsidian Community Plugins**: If the plugin is published in the Obsidian community plugins, you'll need to submit a new plugin or request a rename through the official process.

## Files to Modify

### 1. manifest.json (Required)

This is the main plugin configuration file that Obsidian reads.

```json
{
  "id": "your-new-plugin-id",          // Change from "modalforms"
  "name": "Your New Plugin Name",       // Change from "Modal forms"
  "description": "Your new description",
  "helpUrl": "https://your-new-docs-url/"
}
```

### 2. package.json (Required)

Update the npm package name:

```json
{
  "name": "your-new-plugin-name",       // Change from "obsidian-modal-form"
  "description": "Your new description"
}
```

### 3. package-lock.json (Required)

After changing `package.json`, run:

```bash
npm install
```

This will automatically update `package-lock.json`.

### 4. mkdocs.yml (Optional - Documentation)

Update the documentation site configuration:

```yaml
site_name: Your New Plugin docs
repo_url: https://github.com/your-username/your-new-repo
```

### 5. README.md (Recommended)

Update all references to the old project name, including:

- Title and headings
- Installation URLs
- API references (e.g., `app.plugins.plugins.modalforms.api`)
- Badge URLs

### 6. Source Code References

The following files contain hardcoded references that may need updating:

| File | Content to Change |
|------|-------------------|
| `src/ModalFormSettingTab.ts` | Update the GitHub URL in line 18-19 (the `href` attribute pointing to `https://github.com/danielo515/obsidian-modal-form`) to your new repository URL |

### 7. Example Templates

Update API references in all example files:

- `EXAMPLE_VAULT/000 - Templates/*.md`
- `examples/*.md`
- `docs/*.md`

Change:
```javascript
const modalForm = app.plugins.plugins.modalforms.api;
```

To:
```javascript
const modalForm = app.plugins.plugins.yournewid.api;
```

### 8. Community Plugins Configuration

If you have an example vault, update the plugin ID in:
- `EXAMPLE_VAULT/.obsidian/community-plugins.json` - Change `"modalforms"` to your new plugin ID (e.g., `"your-new-plugin-id"`)

## Step-by-Step Renaming Process

1. **Choose your new names:**
   - Plugin ID (e.g., `my-custom-forms`)
   - Display name (e.g., `My Custom Forms`)
   - Repository name (e.g., `my-custom-forms`)

2. **Update core files:**
   ```bash
   # Edit manifest.json and package.json
   # Then regenerate package-lock.json
   npm install
   ```

3. **Update documentation files:**
   - README.md
   - docs/*.md
   - mkdocs.yml

4. **Update code references:**
   - src/ModalFormSettingTab.ts

5. **Update examples:**
   - EXAMPLE_VAULT/**/*.md
   - examples/*.md

6. **Search for remaining references:**
   ```bash
   # Search for old plugin ID
   grep -r "modalforms" --include="*.md" --include="*.json" --include="*.ts"
   
   # Search for old repository name
   grep -r "obsidian-modal-form" --include="*.md" --include="*.json" --include="*.yml"
   ```

7. **Test the plugin:**
   ```bash
   npm run build
   ```

8. **Test in Obsidian:**
   - Copy `main.js`, `manifest.json`, and `styles.css` to your vault's `.obsidian/plugins/your-new-id/` folder
   - Enable the plugin and verify it works

## GitHub Repository Renaming

If you also want to rename the GitHub repository:

1. Go to repository Settings
2. Change the repository name
3. Update all documentation URLs
4. Update `mkdocs.yml` with the new repository URL

## Versioning

The `versions.json` file contains the version history. You may want to:
- Keep it as-is for historical reference
- Or start fresh with a new version history

---

**Note:** This guide assumes you're creating a fork or derivative of the project. If you're contributing to the original project, please discuss any naming changes with the maintainer first.
