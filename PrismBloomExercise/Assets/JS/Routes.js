import { loadHeaderFooter, HF_main } from "./HeaderFooter.js";
import { loadBranch } from "./OpenJsons.js";

let allRoutes = [];
let zipCenter = null;
let routesConfig = {};

function normalizeText(value){
	return String(value || "").trim();
}

function normalizeSearch(value){
	return normalizeText(value).toLowerCase();
}

function getRouteLocationText(route){
	const pieces = [];
	const locations = [route.startLocation, route.endLocation, ...(route.points || [])];

	locations.forEach(location => {
		if(!location) return;
		pieces.push(location.name, location.address, location.latLon, location.zip);
	});

	return pieces.filter(Boolean).join(" ");
}

function getRouteSearchText(route){
	return [
		route.name,
		route.activity,
		route.category,
		route.distance,
		route.distanceUnit,
		route.estimatedMinutes,
		getRouteLocationText(route)
	].filter(Boolean).join(" ");
}

function parseLatLon(value){
	const text = normalizeText(value);

	if(!text.includes(",")){
		return null;
	}

	const parts = text.split(",").map(part => Number(part.trim()));

	if(parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])){
		return null;
	}

	return {
		lat: parts[0],
		lon: parts[1]
	};
}

function distanceMiles(a, b){
	const earthRadiusMiles = 3958.8;
	const toRadians = degrees => degrees * Math.PI / 180;
	const dLat = toRadians(b.lat - a.lat);
	const dLon = toRadians(b.lon - a.lon);
	const lat1 = toRadians(a.lat);
	const lat2 = toRadians(b.lat);

	const h = Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

	return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function getRouteCoordinates(route){
	const locations = [route.startLocation, route.endLocation, ...(route.points || [])];

	return locations
		.map(location => parseLatLon(location?.latLon))
		.filter(Boolean);
}

function routeIsWithinRadius(route, center, radius){
	if(!center){
		return true;
	}

	const coordinates = getRouteCoordinates(route);

	if(coordinates.length === 0){
		return false;
	}

	return coordinates.some(point => distanceMiles(center, point) <= radius);
}

function getUniqueValues(routes, key){
	return [...new Set(routes.map(route => normalizeText(route[key])).filter(Boolean))]
		.sort((a, b) => a.localeCompare(b));
}

function fillSelect(select, values, firstLabel){
	if(!select){
		return;
	}

	select.innerHTML = "";

	const first = document.createElement("option");
	first.value = "";
	first.textContent = firstLabel;
	select.appendChild(first);

	values.forEach(value => {
		const option = document.createElement("option");
		option.value = value;
		option.textContent = value;
		select.appendChild(option);
	});
}

function createTag(text){
	const tag = document.createElement("span");
	tag.className = "route-tag";
	tag.textContent = text;
	return tag;
}

function createField(label, value){
	const field = document.createElement("div");
	field.className = "route-field";

	const labelEl = document.createElement("b");
	labelEl.textContent = label;

	const valueEl = document.createElement("span");
	valueEl.textContent = normalizeText(value) || "Not listed";

	field.append(labelEl, valueEl);
	return field;
}

function formatDistance(route){
	const distance = normalizeText(route.distance);
	const unit = normalizeText(route.distanceUnit);

	if(!distance){
		return "Not listed";
	}

	return unit ? `${distance} ${unit}` : distance;
}

function formatMinutes(minutes){
	const value = Number(minutes);

	if(Number.isNaN(value) || value <= 0){
		return normalizeText(minutes) || "Not listed";
	}

	if(value < 60){
		return `${value} min`;
	}

	const hours = Math.floor(value / 60);
	const remainingMinutes = value % 60;

	if(remainingMinutes === 0){
		return `${hours} hr`;
	}

	return `${hours} hr ${remainingMinutes} min`;
}

function formatLocation(location){
	if(!location){
		return "Not listed";
	}

	const name = normalizeText(location.name);
	const address = normalizeText(location.address);
	const zip = normalizeText(location.zip);

	return [name, address, zip].filter(Boolean).join(" • ") || "Not listed";
}

function renderRouteCard(route){
	const card = document.createElement("article");
	card.className = "route-card";

	const title = document.createElement("h2");
	title.textContent = normalizeText(route.name) || "Unnamed route";

	const tags = document.createElement("div");
	tags.className = "route-tags";

	if(route.activity) tags.appendChild(createTag(route.activity));
	if(route.category) tags.appendChild(createTag(route.category));
	if(route.distance) tags.appendChild(createTag(formatDistance(route)));
	if(route.estimatedMinutes) tags.appendChild(createTag(formatMinutes(route.estimatedMinutes)));

	const summary = document.createElement("div");
	summary.className = "route-summary";
	summary.appendChild(createField("Start", formatLocation(route.startLocation)));
	summary.appendChild(createField("End", formatLocation(route.endLocation)));
	summary.appendChild(createField("Distance", formatDistance(route)));
	summary.appendChild(createField("Estimated time", formatMinutes(route.estimatedMinutes)));

	card.append(title, tags, summary);

	const points = route.points || [];

	if(points.length > 0){
		const pointsTitle = document.createElement("h3");
		pointsTitle.className = "route-points-title";
		pointsTitle.textContent = "Route points";

		const pointList = document.createElement("ol");
		pointList.className = "route-points";

		points.forEach((point, index) => {
			const item = document.createElement("li");
			item.className = "route-point";

			const number = document.createElement("strong");
			number.textContent = `${index + 1}.`;

			const text = document.createElement("div");
			text.textContent = normalizeText(point.name) || "Unnamed location";

			if(point.latLon){
				const small = document.createElement("small");
				small.textContent = point.latLon;
				text.appendChild(small);
			}

			item.append(number, text);
			pointList.appendChild(item);
		});

		card.append(pointsTitle, pointList);
	}

	return card;
}

function getFilters(){
	return {
		search: normalizeSearch(document.querySelector("[data-route-search]")?.value),
		activity: normalizeText(document.querySelector("[data-activity-filter]")?.value),
		category: normalizeText(document.querySelector("[data-category-filter]")?.value),
		radius: Number(document.querySelector("[data-radius-filter]")?.value || routesConfig.defaultRadiusMiles || 10)
	};
}

function applyFilters(){
	const filters = getFilters();

	return allRoutes.filter(route => {
		const searchText = normalizeSearch(getRouteSearchText(route));
		const matchesSearch = !filters.search || searchText.includes(filters.search);
		const matchesActivity = !filters.activity || normalizeText(route.activity) === filters.activity;
		const matchesCategory = !filters.category || normalizeText(route.category) === filters.category;
		const matchesRadius = routeIsWithinRadius(route, zipCenter, filters.radius);

		return matchesSearch && matchesActivity && matchesCategory && matchesRadius;
	});
}

function renderRoutes(){
	const list = document.querySelector("[data-routes-list]");
	const status = document.querySelector("[data-routes-status]");

	if(!list || !status){
		return;
	}

	const filteredRoutes = applyFilters();
	list.innerHTML = "";

	if(filteredRoutes.length === 0){
		const empty = document.createElement("div");
		empty.className = "empty-state";
		empty.textContent = "No routes match the current filters.";
		list.appendChild(empty);
		status.textContent = `Showing 0 of ${allRoutes.length} routes`;
		return;
	}

	filteredRoutes.forEach(route => list.appendChild(renderRouteCard(route)));
	status.textContent = `Showing ${filteredRoutes.length} of ${allRoutes.length} routes`;
}

async function fetchZipCenter(zip){
	const cleanZip = normalizeText(zip).replace(/\D/g, "");

	if(cleanZip.length !== 5){
		zipCenter = null;
		renderRoutes();
		return;
	}

	const status = document.querySelector("[data-routes-status]");
	if(status){
		status.textContent = `Checking ZIP ${cleanZip}...`;
	}

	const urlTemplate = routesConfig.zipApiUrl || "https://api.zippopotam.us/us/{zip}";
	const response = await fetch(urlTemplate.replace("{zip}", cleanZip));

	if(!response.ok){
		zipCenter = null;
		if(status){
			status.textContent = `Could not find ZIP ${cleanZip}. Showing all matching routes instead.`;
		}
		renderRoutes();
		return;
	}

	const data = await response.json();
	const place = data.places?.[0];

	if(!place){
		zipCenter = null;
		renderRoutes();
		return;
	}

	zipCenter = {
		lat: Number(place.latitude),
		lon: Number(place.longitude)
	};

	renderRoutes();
}

function debounce(fn, delay){
	let timer = null;

	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), delay);
	};
}

function setupFilters(){
	const search = document.querySelector("[data-route-search]");
	const activity = document.querySelector("[data-activity-filter]");
	const category = document.querySelector("[data-category-filter]");
	const zip = document.querySelector("[data-zip-filter]");
	const radius = document.querySelector("[data-radius-filter]");
	const clear = document.querySelector("[data-clear-filters]");

	fillSelect(activity, getUniqueValues(allRoutes, "activity"), "All activities");
	fillSelect(category, getUniqueValues(allRoutes, "category"), "All categories");

	const rerender = () => renderRoutes();
	const updateZip = debounce(() => fetchZipCenter(zip?.value), 500);

	search?.addEventListener("input", rerender);
	activity?.addEventListener("change", rerender);
	category?.addEventListener("change", rerender);
	radius?.addEventListener("change", rerender);
	zip?.addEventListener("input", updateZip);

	clear?.addEventListener("click", () => {
		if(search) search.value = "";
		if(activity) activity.value = "";
		if(category) category.value = "";
		if(zip) zip.value = "";
		if(radius) radius.value = String(routesConfig.defaultRadiusMiles || 10);
		zipCenter = null;
		renderRoutes();
	});
}

function loadRoutesJsonp(url){
	return new Promise((resolve, reject) => {
		const callbackName = "RouteDataCallback_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
		const separator = url.includes("?") ? "&" : "?";
		const script = document.createElement("script");

		window[callbackName] = function(data){
			delete window[callbackName];
			script.remove();
			resolve(data);
		};

		script.src = url + separator + "callback=" + encodeURIComponent(callbackName);
		script.onerror = function(){
			delete window[callbackName];
			script.remove();
			reject(new Error("Failed to load route data."));
		};

		document.body.appendChild(script);
	});
}

async function loadRoutes(){
	const status = document.querySelector("[data-routes-status]");
	const apiUrl = normalizeText(routesConfig.appsScriptUrl);

	if(!apiUrl || apiUrl.includes("PASTE_YOUR_APPS_SCRIPT")){
		throw new Error("Paste your Apps Script web app URL into Assets/Json/Routes.json first.");
	}

	if(status){
		status.textContent = "Loading routes...";
	}

	const data = await loadRoutesJsonp(apiUrl);
	allRoutes = Array.isArray(data.routes) ? data.routes : [];
}

async function main(){
	await loadHeaderFooter();
	await HF_main();

	routesConfig = await loadBranch("Routes");
	await loadRoutes();
	setupFilters();
	renderRoutes();
}

main().catch(err => {
	console.error(err);
	const status = document.querySelector("[data-routes-status]");
	const list = document.querySelector("[data-routes-list]");

	if(status){
		status.textContent = err.message;
	}

	if(list){
		list.innerHTML = `<div class="empty-state">${err.message}</div>`;
	}
});
