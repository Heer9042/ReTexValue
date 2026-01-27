# Contributing to ReTexValue

First off, thank you for considering contributing to ReTexValue! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Database Changes](#database-changes)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please be respectful and constructive in your interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, Node version)

### Suggesting Features

Feature requests are welcome! Please provide:

- **Clear use case**
- **Expected behavior**
- **Why this benefits the project**
- **Alternative solutions considered**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Test thoroughly
4. Update documentation
5. Submit a pull request

## Development Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/ReTexValue.git
cd ReTexValue

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Add your Supabase credentials

# 4. Run migrations
# Execute SQL files in Supabase Dashboard

# 5. Start dev server
npm run dev
```

## Pull Request Process

1. **Branch Naming**
   - `feature/` - New features
   - `fix/` - Bug fixes
   - `docs/` - Documentation updates
   - `refactor/` - Code refactoring

2. **Commit Messages**
   - Use present tense ("Add feature" not "Added feature")
   - Be descriptive but concise
   - Reference issues when applicable

   ```bash
   git commit -m "Add bulk export feature for admin reports (#123)"
   ```

3. **Before Submitting**
   - [ ] Code follows project style
   - [ ] Tests pass (if applicable)
   - [ ] Documentation updated
   - [ ] No console errors
   - [ ] Tested in both light and dark mode

4. **PR Description**
   Include:
   - What changed and why
   - Screenshots (for UI changes)
   - Testing done
   - Related issues

## Coding Standards

### JavaScript/React

```javascript
// ✅ Good
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await addPackage(formData);
    navigate("/admin/packages");
  } catch (error) {
    console.error("Failed to add package:", error);
  }
};

// ❌ Avoid
const handleSubmit = async (e) => {
  e.preventDefault();
  addPackage(formData);
  navigate("/admin/packages");
};
```

### Component Structure

```javascript
// 1. Imports
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// 2. Component
export default function MyComponent({ prop1, prop2 }) {
  // 3. Hooks
  const navigate = useNavigate();
  const [state, setState] = useState(null);

  // 4. Functions
  const handleClick = () => {
    // ...
  };

  // 5. Render
  return <div>{/* JSX */}</div>;
}

// 6. Helper components (if needed)
function HelperComponent() {
  return <div>Helper</div>;
}
```

### CSS/Tailwind

- Use Tailwind utility classes
- Follow mobile-first approach
- Include dark mode variants
- Keep consistent spacing

```jsx
// ✅ Good
<div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg">

// ❌ Avoid inline styles
<div style={{ padding: '16px', backgroundColor: 'white' }}>
```

### File Naming

- Components: `PascalCase.jsx` (e.g., `AdminDashboard.jsx`)
- Utilities: `camelCase.js` (e.g., `supabase.js`)
- Styles: `kebab-case.css` (e.g., `index.css`)

## Database Changes

### Adding a New Table

1. Create migration SQL file in root:

   ```
   tablename_schema.sql
   ```

2. Include:
   - Table creation
   - Indexes
   - Sample data (optional)
   - Triggers (if needed)

3. Create RLS policies:

   ```
   tablename_rls_policies.sql
   ```

4. Document in README.md

### Example

```sql
-- new_feature_schema.sql
CREATE TABLE feature_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- new_feature_rls_policies.sql
ALTER TABLE feature_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
ON feature_data FOR SELECT
USING (true);
```

## Testing

### Manual Testing Checklist

- [ ] Tested on Chrome, Firefox, Safari
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] No console errors
- [ ] Forms validate properly
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Success messages displayed

### Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Questions?

Feel free to open an issue or reach out to the maintainers!

Thank you for contributing! 🙌
