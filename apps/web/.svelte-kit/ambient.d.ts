
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const NEXT_PUBLIC_API_URL: string;
	export const NEXT_PUBLIC_FIREBASE_API_KEY: string;
	export const NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
	export const NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
	export const NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
	export const NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
	export const NEXT_PUBLIC_FIREBASE_APP_ID: string;
	export const NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: string;
	export const SVELTEKIT_FORK: string;
	export const NODE_ENV: string;
	export const TERM_PROGRAM: string;
	export const GOPATH: string;
	export const npm_node_execpath: string;
	export const KITTY_INSTALLATION_DIR: string;
	export const GDMSESSION: string;
	export const PATH: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const npm_package_json: string;
	export const DEBUGINFOD_URLS: string;
	export const ANTHROPIC_AUTH_TOKEN: string;
	export const npm_execpath: string;
	export const npm_config_user_agent: string;
	export const MANAGERPIDFDID: string;
	export const QT_IM_MODULE: string;
	export const NVM_CD_FLAGS: string;
	export const SHLVL: string;
	export const DEBUGINFOD_IMA_CERT_PATH: string;
	export const npm_lifecycle_event: string;
	export const DISPLAY: string;
	export const BUN_INSTALL: string;
	export const TMUX_PANE: string;
	export const USER: string;
	export const XDG_DATA_DIRS: string;
	export const LESSOPEN: string;
	export const ZSH: string;
	export const JOURNAL_STREAM: string;
	export const TERMINFO: string;
	export const XDG_SESSION_CLASS: string;
	export const MCP_TIMEOUT: string;
	export const CLAUDE_CODE_EXECPATH: string;
	export const MCP_TOOL_TIMEOUT: string;
	export const GNOME_SETUP_DISPLAY: string;
	export const NVM_DIR: string;
	export const npm_lifecycle_script: string;
	export const GOROOT: string;
	export const INVOCATION_ID: string;
	export const NVM_BIN: string;
	export const XMODIFIERS: string;
	export const HISTSIZE: string;
	export const DESKTOP_SESSION: string;
	export const XDG_SESSION_EXTRA_DEVICE_ACCESS: string;
	export const QT_IM_MODULES: string;
	export const XDG_RUNTIME_DIR: string;
	export const NODE_OPTIONS: string;
	export const CLAUDE_CODE_SESSION_ID: string;
	export const CLAUDE_OBSIDIAN_VAULT: string;
	export const CLAUDE_CODE_CHILD_SESSION: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const API_TIMEOUT_MS: string;
	export const HOSTNAME: string;
	export const CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: string;
	export const ANTHROPIC_BASE_URL: string;
	export const GPG_TTY: string;
	export const AI_AGENT: string;
	export const COLORTERM: string;
	export const NVM_INC: string;
	export const CLAUDE_EFFORT: string;
	export const LSCOLORS: string;
	export const TMUX: string;
	export const SYSTEMD_EXEC_PID: string;
	export const COREPACK_ENABLE_AUTO_PIN: string;
	export const NODE: string;
	export const TMUX_PLUGIN_MANAGER_PATH: string;
	export const CLAUDE_CODE_MAX_CONTEXT_TOKENS: string;
	export const EDITOR: string;
	export const TERM: string;
	export const BASH_MAX_TIMEOUT_MS: string;
	export const SHELL: string;
	export const CLAUDE_PID: string;
	export const LESS: string;
	export const OLDPWD: string;
	export const TERMINAL: string;
	export const WAYLAND_DISPLAY: string;
	export const HISTCONTROL: string;
	export const MAIL: string;
	export const SSH_AUTH_SOCK: string;
	export const TERM_PROGRAM_VERSION: string;
	export const npm_package_name: string;
	export const XDG_MENU_PREFIX: string;
	export const BASH_DEFAULT_TIMEOUT_MS: string;
	export const NoDefaultCurrentDirectoryInExePath: string;
	export const CLAUDE_CODE_ENTRYPOINT: string;
	export const PWD: string;
	export const npm_command: string;
	export const KITTY_PID: string;
	export const LOGNAME: string;
	export const XDG_SESSION_DESKTOP: string;
	export const MOZ_GMP_PATH: string;
	export const CLAUDE_CODE_MESSAGING_SOCKET: string;
	export const XDG_SESSION_TYPE: string;
	export const GIO_LAUNCHED_DESKTOP_FILE_PID: string;
	export const MANAGERPID: string;
	export const CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY: string;
	export const npm_config_local_prefix: string;
	export const XAUTHORITY: string;
	export const CLAUDE_CODE_MESSAGING_TOKEN: string;
	export const KITTY_PUBLIC_KEY: string;
	export const CLAUDECODE: string;
	export const GDM_LANG: string;
	export const DISABLE_TELEMETRY: string;
	export const HOME: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const USERNAME: string;
	export const LANG: string;
	export const LS_COLORS: string;
	export const _: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const KITTY_WINDOW_ID: string;
	export const GIT_EDITOR: string;
	export const CLAUDE_API_TIMEOUT: string;
	export const PAGER: string;
	export const GITHUB_PERSONAL_ACCESS_TOKEN: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		NEXT_PUBLIC_API_URL: string;
		NEXT_PUBLIC_FIREBASE_API_KEY: string;
		NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
		NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
		NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
		NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
		NEXT_PUBLIC_FIREBASE_APP_ID: string;
		NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: string;
		SVELTEKIT_FORK: string;
		NODE_ENV: string;
		TERM_PROGRAM: string;
		GOPATH: string;
		npm_node_execpath: string;
		KITTY_INSTALLATION_DIR: string;
		GDMSESSION: string;
		PATH: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		npm_package_json: string;
		DEBUGINFOD_URLS: string;
		ANTHROPIC_AUTH_TOKEN: string;
		npm_execpath: string;
		npm_config_user_agent: string;
		MANAGERPIDFDID: string;
		QT_IM_MODULE: string;
		NVM_CD_FLAGS: string;
		SHLVL: string;
		DEBUGINFOD_IMA_CERT_PATH: string;
		npm_lifecycle_event: string;
		DISPLAY: string;
		BUN_INSTALL: string;
		TMUX_PANE: string;
		USER: string;
		XDG_DATA_DIRS: string;
		LESSOPEN: string;
		ZSH: string;
		JOURNAL_STREAM: string;
		TERMINFO: string;
		XDG_SESSION_CLASS: string;
		MCP_TIMEOUT: string;
		CLAUDE_CODE_EXECPATH: string;
		MCP_TOOL_TIMEOUT: string;
		GNOME_SETUP_DISPLAY: string;
		NVM_DIR: string;
		npm_lifecycle_script: string;
		GOROOT: string;
		INVOCATION_ID: string;
		NVM_BIN: string;
		XMODIFIERS: string;
		HISTSIZE: string;
		DESKTOP_SESSION: string;
		XDG_SESSION_EXTRA_DEVICE_ACCESS: string;
		QT_IM_MODULES: string;
		XDG_RUNTIME_DIR: string;
		NODE_OPTIONS: string;
		CLAUDE_CODE_SESSION_ID: string;
		CLAUDE_OBSIDIAN_VAULT: string;
		CLAUDE_CODE_CHILD_SESSION: string;
		MEMORY_PRESSURE_WATCH: string;
		API_TIMEOUT_MS: string;
		HOSTNAME: string;
		CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: string;
		ANTHROPIC_BASE_URL: string;
		GPG_TTY: string;
		AI_AGENT: string;
		COLORTERM: string;
		NVM_INC: string;
		CLAUDE_EFFORT: string;
		LSCOLORS: string;
		TMUX: string;
		SYSTEMD_EXEC_PID: string;
		COREPACK_ENABLE_AUTO_PIN: string;
		NODE: string;
		TMUX_PLUGIN_MANAGER_PATH: string;
		CLAUDE_CODE_MAX_CONTEXT_TOKENS: string;
		EDITOR: string;
		TERM: string;
		BASH_MAX_TIMEOUT_MS: string;
		SHELL: string;
		CLAUDE_PID: string;
		LESS: string;
		OLDPWD: string;
		TERMINAL: string;
		WAYLAND_DISPLAY: string;
		HISTCONTROL: string;
		MAIL: string;
		SSH_AUTH_SOCK: string;
		TERM_PROGRAM_VERSION: string;
		npm_package_name: string;
		XDG_MENU_PREFIX: string;
		BASH_DEFAULT_TIMEOUT_MS: string;
		NoDefaultCurrentDirectoryInExePath: string;
		CLAUDE_CODE_ENTRYPOINT: string;
		PWD: string;
		npm_command: string;
		KITTY_PID: string;
		LOGNAME: string;
		XDG_SESSION_DESKTOP: string;
		MOZ_GMP_PATH: string;
		CLAUDE_CODE_MESSAGING_SOCKET: string;
		XDG_SESSION_TYPE: string;
		GIO_LAUNCHED_DESKTOP_FILE_PID: string;
		MANAGERPID: string;
		CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY: string;
		npm_config_local_prefix: string;
		XAUTHORITY: string;
		CLAUDE_CODE_MESSAGING_TOKEN: string;
		KITTY_PUBLIC_KEY: string;
		CLAUDECODE: string;
		GDM_LANG: string;
		DISABLE_TELEMETRY: string;
		HOME: string;
		MEMORY_PRESSURE_WRITE: string;
		USERNAME: string;
		LANG: string;
		LS_COLORS: string;
		_: string;
		XDG_CURRENT_DESKTOP: string;
		KITTY_WINDOW_ID: string;
		GIT_EDITOR: string;
		CLAUDE_API_TIMEOUT: string;
		PAGER: string;
		GITHUB_PERSONAL_ACCESS_TOKEN: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
