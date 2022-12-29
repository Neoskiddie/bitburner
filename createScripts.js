/** @param {NS} ns */
export async function main(ns) {
	createScripts(ns);
}

async function createScripts(ns) {
		await ns.write("/deployScripts/hack.js", 
`/** @param {NS} ns */
export async function main(ns) {
	while(true) {
		await ns.hack(ns.args[0]);
	}
}`, "w");

	await ns.write("/deployScripts/grow.js", 
`/** @param {NS} ns */
export async function main(ns) {
	while(true) {
		await ns.grow(ns.args[0]);
	}
}`, "w");

	await ns.write("/deployScripts/weaken.js", 
`/** @param {NS} ns */
export async function main(ns) {
	while(true) {
		await ns.weaken(ns.args[0]);
	}
}`, "w");
}