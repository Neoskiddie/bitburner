/** @param {NS} ns */
export async function main(ns) {
	let listOfServers = ns.scan();
	hackAllTheThings(ns, listOfServers);
}

function hackAllTheThings(ns, listOfServers) {
	if (listOfServers.length === 0) {
		return;
	}

	for (let x = 0; x < listOfServers.length; x++) {
		let current = listOfServers[x];

		let newScan = ns.scan(current);
		ns.print(newScan.shift())
		ns.print(newScan)
		if (newScan !== null && newScan.length >= 1 && Object.prototype.toString.call(newScan) === '[object Array]') {
			hackAllTheThings(ns, newScan);
		}

		if (ns.hasRootAccess(current)) {
			return;
		}
		
		try {
			ns.tprint("Hacking " + current + "...")
			ns.brutessh(current);
			ns.ftpcrack(current);
			ns.httpworm(current);
			ns.relaysmtp(current)
			ns.nuke(current);
		} catch {
			ns.tprint("Could not hack: " + current);
		}
	}
}