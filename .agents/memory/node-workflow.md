---
name: Node path for workflow
description: Node.js binary is not in PATH when running workflows on this Replit instance; must use the full nix store path.
---

The correct Node.js binary path for use in workflow commands is:

`/nix/store/bl6iwirn83qj9r8wng43kfdqd5mfahj8-nodejs-22.22.0/bin/node`

**Why:** Replit's workflow runner does not have `/usr/bin/node` or standard node paths available. Only the nix store path works.

**How to apply:** Any workflow that needs to run Node.js must use this full path. Example:
```
PORT=5000 /nix/store/bl6iwirn83qj9r8wng43kfdqd5mfahj8-nodejs-22.22.0/bin/node server.js
```

Use `available-pid2-node-paths` in bash to find the current path if the hash changes.
