let allHosts = [];

export async function main(ns) {
	allHosts = [];
	let listOfServers = ns.scan();
	scanAll(ns, listOfServers, []);
	ns.tprint(allHosts);
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