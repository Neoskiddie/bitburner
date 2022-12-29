/** @param {NS} ns */
export async function main(ns) {
	let nameOfServer = ns.args[0];
	let security = ns.getServerSecurityLevel(nameOfServer);
	let money = ns.getServerMoneyAvailable(nameOfServer);

	while (true) {
		await ns.hack(nameOfServer);
		ns.print("Hacking...")
		while (ns.getServerSecurityLevel(nameOfServer) > security + 10) {
			await ns.weaken(nameOfServer);
			ns.print("Weakening...");
		}

		while (ns.getServerMoneyAvailable(nameOfServer) < money - 1000000 ||
			ns.getServerMoneyAvailable < 10000) {

			await ns.grow(nameOfServer);
			ns.print("Adding money...");
		}
	}
}