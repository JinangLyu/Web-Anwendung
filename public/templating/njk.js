import 'https://cdn.jsdelivr.net/npm/nunjucks@3.2.4/browser/nunjucks.min.js';
// Based on https://gist.github.com/little-brother/c06114cf73cddfca1372c04e3e138867

const env = nunjucks.configure({autoescape: true, web: {async: true}});

/*
With custom loader

const MyLoader = nunjucks.Loader.extend({
	async: true,
	getSource: function(path, cb) {
		fetch(path) //  `/templates/${path}.njk`
			.then(res => res.text())
			.then(src => cb(null, {src, path, noCache: false}))
			.catch(cb);
	}
});

const env = new nunjucks.Environment(new MyLoader(), {autoescape: true});
*/

// Add filters
env.addFilter('print', console.log);
env.addFilter('time', datetime => new Date(datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
env.addFilter('date', datetime => new Date(datetime).toLocaleDateString([], {dateStyle: 'short', timeStyle: undefined}));
env.addFilter('datetime', datetime => new Date(datetime).toLocaleString([], {dateStyle: 'short', timeStyle: 'short'}));
env.addFilter('isodate', datetime => new Date(datetime).toISOString().split('T')[0]);
env.addFilter('isodatetime', datetime => new Date(datetime).toISOString());
env.addFilter('datetime_local_value', datetime => datetime && datetime.getTime && datetime.getTimezoneOffset ? new Date(datetime.getTime() + datetime.getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 19) : datetime);
env.addFilter('json', (data) => JSON.stringify(data, null, 2));
env.addFilter('price', (float) => isNaN(float) ? '-.--' : float.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));

// add globals
env.addGlobal('now', () => Date.now());
env.addGlobal('location', () => location);


export default env;

export function applyWhenDocumentLoaded(fn, ...args) {
    if(document.readyState === "complete") {
        fn(...args);
    } else {
        document.addEventListener("DOMContentLoaded", () => fn(...args));
    }
}