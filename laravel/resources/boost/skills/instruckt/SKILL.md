---
name: instruckt
description: "Visual feedback from users via in-browser annotations. Activates when the user pastes UI feedback markdown starting with '# UI Feedback', when annotations or visual feedback are mentioned, or when you need to check for pending UI feedback via MCP."
license: MIT
metadata:
  author: joshcirre
---
# Instruckt — Visual Feedback for AI Agents

Instruckt lets users annotate elements directly in the browser. The user pastes structured markdown into the chat — everything you need is in the paste.

## Workflow

When the user pastes UI feedback:

1. **Make the fix** — the pasted markdown has the element, component, classes, and text context to find the right code
2. **Resolve via MCP** — call `instruckt.get_all_pending` to get annotation IDs, then call `instruckt.resolve` for each one you fixed. This removes the markers from the user's browser automatically (no reload needed).

That's it. Two steps: fix, then resolve.

## Recognizing Pasted Feedback

When the user pastes text like this, treat it as instruckt annotations:

```
# UI Feedback: /dashboard

## 1. Change the heading text
- Element: `h1.text-xl` in `pages::dashboard`
- Classes: `text-xl font-bold`
- Text: "Welcome"
```

Each `##` item is one annotation. The component name (e.g. `pages::dashboard`) tells you which file to edit.

## MCP Tools

| Tool | When to use |
|------|-------------|
| `instruckt.get_all_pending` | Get annotation IDs so you can resolve them |
| `instruckt.resolve` | Mark as resolved after fixing — include a summary |
| `instruckt.dismiss` | Dismiss an annotation that doesn't need action |
| `instruckt.reply` | Ask a clarifying question |
| `instruckt.acknowledge` | Mark as "seen" (optional) |

## Best Practices

- **Always resolve after fixing** — without this, the marker stays visible in the user's browser
- Call `get_all_pending` once to get all IDs, then resolve each after fixing
- When resolving, include a clear summary: "Changed heading to 'Welcome!' in `resources/views/pages/dashboard.blade.php`"
- The component name tells you which file to look at — use it to navigate directly
- Use `reply` to ask questions rather than guessing
