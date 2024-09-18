import njk from './njk.js';

window.onload = function() {
	const $e = document.querySelector('body');
	njk.render('templates/kassenbon.njk', {
        location,
    }, (err, html) => $e.innerHTML = err && err.message || html);
};