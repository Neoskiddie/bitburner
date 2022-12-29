/** @param {NS} ns */
export async function main(ns) {
	let nameOfServer = ns.args[0];
	while (ns.getServerSecurityLevel(nameOfServer) > ns.getServerMinSecurityLevel(nameOfServer)) {
		await ns.weaken(nameOfServer);
	}
	
	while (ns.getServerMoneyAvailable(nameOfServer) < ns.getServerMaxMoney(nameOfServer)) {
		//ns.getServerMoneyAvailable < 10000) {
		await ns.grow(nameOfServer);
	}

	while (true) {
		await ns.hack(nameOfServer);
	}
}