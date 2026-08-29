// in dev, this makes Vite inject its client as this module's first dependency,
// so that global constant replacements are installed before any other module
// (including user hooks) evaluates. In build it's inert.
import.meta.hot;




export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26')
];

export const server_loads = [];

export const dictionary = {
		"/": [3],
		"/admin": [11,[2]],
		"/admin/commission": [12,[2]],
		"/admin/disputes": [13,[2]],
		"/admin/metrics": [14,[2]],
		"/admin/refunds": [15,[2]],
		"/admin/transactions": [16,[2]],
		"/admin/venues": [17,[2]],
		"/admin/vouchers": [18,[2]],
		"/(auth)/auth/forgot-password": [4],
		"/(auth)/auth/login": [5],
		"/(auth)/auth/signup": [6],
		"/bookings": [22],
		"/bookings/[id]": [23],
		"/booking/[id]/invite": [19],
		"/booking/[id]/payment": [20],
		"/booking/[id]/success": [21],
		"/dashboard": [24],
		"/invites/[token]": [25],
		"/notifications": [26],
		"/(marketing)/venues": [7],
		"/(marketing)/venues/[id]": [8],
		"/(marketing)/venues/[id]/book": [9],
		"/(marketing)/vouchers": [10]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));
export const encoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.encode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';

export const get_error_template = () => import('../shared/error-template.js').then(m => m.default);