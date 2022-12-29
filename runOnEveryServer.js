// copy first argument to every available server
// then run the first argument on the server
/** @param {NS} ns */
let allHosts = [];

export async function main(ns) {
	let listOfServers = ns.scan();
	scanAll(ns, listOfServers, []);

	for (let x = 0; x < allHosts.length; x++) {
		let currentServer = allHosts[x];
		ns.tprint(currentServer);

		//if(currentServer == null) {
		//	continue;
		//}

		ns.scp(ns.args[0], currentServer);
		ns.exec(ns.args[0], currentServer, 1, currentServer);
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