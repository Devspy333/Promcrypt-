const { fengari } = require('fengari-web');
const fs = require('fs');
const path = require('path');

const L = fengari.lauxlib.luaL_newstate();
fengari.lualib.luaL_openlibs(L);

// We need to load prometheus.lua
const code = `
  print("Hello from fengari")
`;

fengari.lauxlib.luaL_dostring(L, fengari.to_luastring(code));
