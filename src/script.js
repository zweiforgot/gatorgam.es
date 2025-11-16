const CACHE_KEY = 'gator_stats_cache';
const CACHE_TIME = 2 * 60 * 1000;





async function getStats() {
	const cached = localStorage.getItem(CACHE_KEY);
	const now = Date.now();

	if (cached) {
		const parsed = JSON.parse(cached);
		if (now - parsed.timestamp < CACHE_TIME) {
			console.log("Using cache")
			return parsed.data;
		}
	}

	console.log("Using remote")
	const res = await fetch('https://games.roproxy.com/v1/games?universeIds=2876137510');
	const json = await res.json();
	const data = json.data && json.data[0] ? json.data[0] : {};

	if (Object.keys(data).length !== 0) {
		localStorage.setItem(CACHE_KEY, JSON.stringify({
			timestamp: now,
			data: data
		}))
	}

	return data;
}

async function updateStats() {
	const stats = await getStats();

	const visitsEl = document.getElementById('stat-visits');
	const favoritesEl = document.getElementById('stat-favorites');
	const activeEl = document.getElementById('stat-ccu');

	if (visitsEl) visitsEl.setAttribute("data-val", stats.visits || 7);
	if (favoritesEl) favoritesEl.setAttribute("data-val", stats.favoritedCount || 7);
	if (activeEl) activeEl.setAttribute("data-val", stats.playing || 7);
}

async function animateStats() {
	const animatedNumbers = document.querySelectorAll('.stat-value');

	animatedNumbers.forEach(numberElement => {
		let startValue = Number(numberElement.textContent);
		const endValue = parseInt(numberElement.getAttribute('data-val'));
		const duration = 1000;
		const increment = Math.ceil(endValue / (duration / 10));

		const counter = setInterval(() => {
			startValue += increment;
			if (startValue >= endValue) {
				startValue = endValue;
				clearInterval(counter);
			}
			numberElement.textContent = startValue;
		}, 10);
	});
}

async function initStats() {
	await updateStats();
	animateStats();
}


window.onload = function() {
	initStats();
}

setInterval(initStats, 5000);


