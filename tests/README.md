# Tests

Unit tests for the pure (DOM-free) helpers in `Pedidos/Web/pedidos.js`.
The test file extracts the verbatim source of those functions from
`pedidos.js` and runs them with Node's built-in test runner — no
dependencies to install.

Run from the repo root:

```sh
node --test tests/pedidos.test.js
```

Limitation: `pedidos.js` is a classic script that boots the whole app on
load, so it cannot be `require()`d as a module. Only pure functions are
covered; DOM, localStorage and fetch behaviour is not tested here.
