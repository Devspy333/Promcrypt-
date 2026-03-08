import { lua, lauxlib, lualib, to_luastring, to_jsstring } from 'fengari-web';

export function testFengari() {
  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);
  const code = to_luastring('return "Hello from fengari"');
  lauxlib.luaL_dostring(L, code);
  return to_jsstring(lua.lua_tostring(L, -1));
}
