/*
|--------------------------------------------------------------------------
| JavaScript entrypoint for running ace commands
|--------------------------------------------------------------------------
|
| DO NOT MODIFY THIS FILE AS IT WILL BE OVERRIDDEN DURING THE BUILD
| PROCESS.
|
| Since we cannot run TypeScript source code using the "node" binary, we
| register a TypeScript transpiler hook (@swc-node/register) – faster than
| ts-node and compatible with Node 20.x.
|
*/

/**
 * Register the SWC hook to transpile TypeScript files on the fly.
 * @swc-node/register is much more compatible with modern AdonisJS than
 * ts-node-maintained when running on Node 20.11.x.
 */
import '@swc-node/register/esm-register'
register()

/**
 * Import ace console entrypoint
 */
await import('./bin/console.js')
