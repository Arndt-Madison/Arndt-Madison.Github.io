async function loadJson(path){
	const res = await fetch(path, { cache: "no-store" });
	console.log("Loaded Status:", res.status, path);

	if(!res.ok){
		throw new Error(`Failed to load ${path} (${res.status})`);
	}

	return await res.json();
}

export async function loadBranch(json){
	let fileName = String(json || "").trim();

	if(!fileName){
		throw new Error("No json file name was provided.");
	}

	if(!fileName.toLowerCase().endsWith(".json")){
		fileName += ".json";
	}

	return await loadJson(`./assets/json/${fileName}`);
}