/** @param {NS} ns */
export async function main(ns) {
	let listOfServers = ns.scan();
	scanAll(ns, listOfServers, []);
}

function scanAll(ns, listOfServers) {
	if (listOfServers.length === 0) {
		return list;
	}

	for (let x = 0; x < listOfServers.length; x++) {
		let current = listOfServers[x];
		ns.tprint(current);

		let newScan = ns.scan(current);
		newScan.shift();
		if (newScan !== null && newScan.length >= 1 && Object.prototype.toString.call(newScan) === '[object Array]') {
			scanAll(ns, newScan);
		}
	}
}