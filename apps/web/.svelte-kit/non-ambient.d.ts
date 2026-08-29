
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/(marketing)" | "/(auth)" | "/" | "/admin" | "/(auth)/auth" | "/(auth)/auth/forgot-password" | "/(auth)/auth/login" | "/(auth)/auth/signup" | "/bookings" | "/bookings/[id]" | "/booking" | "/booking/[id]" | "/booking/[id]/invite" | "/booking/[id]/payment" | "/booking/[id]/success" | "/dashboard" | "/invites" | "/invites/[token]" | "/notifications" | "/(marketing)/venues" | "/(marketing)/venues/[id]" | "/(marketing)/venues/[id]/book" | "/(marketing)/vouchers";
		RouteParams(): {
			"/bookings/[id]": { id: string };
			"/booking/[id]": { id: string };
			"/booking/[id]/invite": { id: string };
			"/booking/[id]/payment": { id: string };
			"/booking/[id]/success": { id: string };
			"/invites/[token]": { token: string };
			"/(marketing)/venues/[id]": { id: string };
			"/(marketing)/venues/[id]/book": { id: string }
		};
		LayoutParams(): {
			"/(marketing)": { id?: string | undefined };
			"/(auth)": Record<string, never>;
			"/": { id?: string | undefined; token?: string | undefined };
			"/admin": Record<string, never>;
			"/(auth)/auth": Record<string, never>;
			"/(auth)/auth/forgot-password": Record<string, never>;
			"/(auth)/auth/login": Record<string, never>;
			"/(auth)/auth/signup": Record<string, never>;
			"/bookings": { id?: string | undefined };
			"/bookings/[id]": { id: string };
			"/booking": { id?: string | undefined };
			"/booking/[id]": { id: string };
			"/booking/[id]/invite": { id: string };
			"/booking/[id]/payment": { id: string };
			"/booking/[id]/success": { id: string };
			"/dashboard": Record<string, never>;
			"/invites": { token?: string | undefined };
			"/invites/[token]": { token: string };
			"/notifications": Record<string, never>;
			"/(marketing)/venues": { id?: string | undefined };
			"/(marketing)/venues/[id]": { id: string };
			"/(marketing)/venues/[id]/book": { id: string };
			"/(marketing)/vouchers": Record<string, never>
		};
		Pathname(): "/" | "/admin" | "/auth/forgot-password" | "/auth/login" | "/auth/signup" | "/bookings" | `/bookings/${string}` & {} | `/booking/${string}/invite` & {} | `/booking/${string}/payment` & {} | `/booking/${string}/success` & {} | "/dashboard" | `/invites/${string}` & {} | "/notifications" | "/venues" | `/venues/${string}` & {} | `/venues/${string}/book` & {} | "/vouchers";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}