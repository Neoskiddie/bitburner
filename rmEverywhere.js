// copy first parameter
/** @param {NS} ns */
let allHosts = [];

export async function main(ns) {
	let listOfServers = ns.scan();
	scanAll(ns, listOfServers, []);

	for (let x = 0; x < allHosts.length; x++) {
		let currentServer = allHosts[x];
		let listOfScripts = ns.ls(currentServer, ".js") // server
		if (listOfServers == null) {
			continue;
		}
		for (let y = 0; y < listOfScripts.length; y++) {
			ns.rm(listOfScripts[y], currentServer);
		}
	}
}

function scanAll(ns, listOfServers) {
	if (listOfServers.length === 0) {
		return list;
	}

	for (let x = 0; x < listOfServers.length; x++) {
		let current = listOfServers[x];
		allHosts.push(current);

		let newScan = ns.scan(current);
		newScan.shift();
		if (newScan !== null && newScan.length >= 1 && Object.prototype.toString.call(newScan) === '[object Array]') {
			scanAll(ns, newScan);
		}
	}
}