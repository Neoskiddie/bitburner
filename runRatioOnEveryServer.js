/** @param {NS} ns */
let allHosts = [];

export async function main(ns) {
	let listOfServers = ns.scan();
	scanAll(ns, listOfServers, []);

	const growScript = "grow.js";
	const hackScript = "hack.js";
	const weakenScript = "weaken.js";

	let serversAlreadyRunning = [];
	let serversNotHackable = [];
	let newServers = [];

	for (let x = 0; x < allHosts.length; x++) {
		let currentServer = allHosts[x];

		if (ns.hackAnalyzeChance(currentServer) < 0.3) { // if low chance ignore this server
			serversNotHackable.push(currentServer);
			ns.tprint('Server "' + currentServer + '" has low hacking chance, ignoring');
			continue;
		}

		if (ns.scriptRunning("hack0.js", currentServer)) {
			serversAlreadyRunning.push(currentServer);
			ns.tprint(currentServer + ' is already running some script, ignoring');
			continue;
		}

		newServers.push(currentServer);
		ns.scp(growScript, currentServer);
		ns.scp(hackScript, currentServer);
		ns.scp(weakenScript, currentServer);

		let ram = ns.getServerRam(currentServer)[0]; // returns array, first argument is total ram

		if (ram <= 4 && ram > 0) {
			copyAndRunXTimes(hackScript, currentServer, 1, ns);
			copyAndRunXTimes(growScript, currentServer, 1, ns);
		} else if (ram <= 8) {
			copyAndRunXTimes(hackScript, currentServer, 1, ns);
			copyAndRunXTimes(weakenScript, currentServer, 1, ns);
			copyAndRunXTimes(growScript, currentServer, 2, ns);
		} else if (ram <= 16) {
			copyAndRunXTimes(hackScript, currentServer, 1, ns);
			copyAndRunXTimes(weakenScript, currentServer, 1, ns);
			copyAndRunXTimes(growScript, currentServer, 6, ns);
		} else {
			copyAndRunXTimes(hackScript, currentServer, 1, ns);
			copyAndRunXTimes(weakenScript, currentServer, 2, ns);
			copyAndRunXTimes(growScript, currentServer, 10, ns);
		}
	}
	ns.tprint('List of not hackable servers: \n' + serversNotHackable);
	ns.tprint('--------------------------------------------------------------------------------');
	ns.tprint('List of servers already running something: \n' + serversAlreadyRunning);
	ns.tprint('--------------------------------------------------------------------------------');
	ns.tprint('New servers \n' + newServers);
}

function copyAndRunXTimes(scriptName, host, numberOfTimesToRun, ns) {
	for (let x = 0; x < numberOfTimesToRun; x++) {
		ns.scp(scriptName, host);
		let newName = scriptName.replace(/\.[^/.]+$/, "") + x + ".js";
		ns.mv(host, scriptName, newName)
		ns.exec(newName, host, 1, host);
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