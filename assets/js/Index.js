import { loadHeaderFooter, HF_main, setText } from "./HeaderFooter.js";
import { loadBranch } from "./OpenJsons.js";

export function renderHome(indexData, settings){
	const page = indexData || {};
	const heroBg = document.querySelector("[data-hero-bg]");
	if(heroBg && settings.brand?.background){
		heroBg.style.backgroundImage = `url("${settings.brand.background}")`;
	}
	setText(document.querySelector("[data-hero-headline]"), page.hero?.headline || "");
	const heroBody = document.querySelector("[data-hero-body]");
	if(heroBody){
		heroBody.innerHTML = "";
		for(const p of (page.hero?.body || [])){
			if(!p.trim()){
				const spacer = document.createElement("div");
				spacer.style.height = "12px";
				heroBody.appendChild(spacer);
				continue;
			}

			const el = document.createElement("p");
			el.textContent = p;
			heroBody.appendChild(el);
		}
	}

	const dynamicSections = document.querySelector("[data-dynamic-sections]");
	if(dynamicSections){
		dynamicSections.innerHTML = "";

		for(const section of (page.sections || [])){
			const card = document.createElement("div");
			card.className = "card";

			if(section.id){
				card.id = section.id;
			}

			const title = document.createElement("h2");
			title.textContent = section.title || "";
			card.appendChild(title);

			const body = document.createElement("div");

			for(const p of (section.body || [])){
				if(!p.trim()){
					const spacer = document.createElement("div");
					spacer.style.height = "12px";
					body.appendChild(spacer);
					continue;
				}

				const el = document.createElement("p");
				el.textContent = p;
				body.appendChild(el);
			}

			card.appendChild(body);
			dynamicSections.appendChild(card);
		}
	}

}

async function main(){
	await loadHeaderFooter();
	const { settings } = await HF_main();
	const indexData = await loadBranch("Index");

	renderHome(indexData, settings);

	if (window.location.hash) {
		const target = document.querySelector(window.location.hash);
		if (target) {
			target.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}
}

main().catch(err=>{
	console.error(err);
	document.body.innerHTML = `<div class="container"><h1>Site failed to load</h1><p>${err.message}</p></div>`;
});
