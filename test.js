/** @param {NS} ns */
export async function main(ns) {
	let hasBackdoor = ns.getServer(ns.args[0]).backdoorInstalled;
	ns.tprint(hasBackdoor);
}