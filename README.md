# Custom Cursor Web Component

A reusable web component that creates a custom cursor with an orange-to-yellow gradient trail effect.

## Usage

1. Include the script in your HTML:
```html
<script src="https://raw.githack.com/DevManSam777/custom-cursor/main/custom-cursor.js" defer></script>
```

2. Add the component to your page:
```html
<custom-cursor></custom-cursor>
```

3. Hide the default cursor:
```css
body {
    cursor: none;
}
```

## Example

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { cursor: none; }
    </style>
</head>
<body>
    <custom-cursor></custom-cursor>
    <h1>Your content here</h1>
    <script src="custom-cursor.js"></script>
</body>
</html>
```

## Features

- Orange-to-yellow gradient trail
- Click animation effects
- Automatically hides on touch devices
- No dependencies required
- Works in all modern browsers