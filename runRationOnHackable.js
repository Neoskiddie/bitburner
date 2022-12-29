/** @param {NS} ns */
let allHosts = [];
let nonHackableHosts = [];

export async function main(ns) {
	let listOfServers = ns.scan();
	getHackable(ns, listOfServers, []);
	getNonHackable(ns, listOfServers, []);

	const growScript = "grow.js";
	const hackScript = "hack.js";
	const weakenScript = "weaken.js";

	let serversAlreadyRunning = [];
	let newServers = [];

	let currentHackableServerIndex = 0;
	for (let x = 0; x < nonHackableHosts.length; x++) {
		let host = nonHackableHosts[x];

		let isHackable = ns.hackAnalyzeChance(host) > 0.3;
		let ram = ns.getServerRam(host)[0]; // returns array, first argument is total ram
		
		if (isHackable || ram == 0) { // if low chance ignore this server
			continue;
		}

		if (ns.scriptRunning("hack0.js", host)) {
			serversAlreadyRunning.push(host);
			ns.tprint(host + ' is already running some script, ignoring');
			continue;
		}

		newServers.push(host);
		ns.scp(growScript, host);
		ns.scp(hackScript, host);
		ns.scp(weakenScript, host);

		let target = allHosts[currentHackableServerIndex];
		if (currentHackableServerIndex + 1 > allHosts.length - 1) {
			currentHackableServerIndex = 0;
		} else {
			currentHackableServerIndex++;
		}

		if (ram <= 4 && ram > 0) {
			copyAndRunXTimes(hackScript, host, target, 1, ns);
			copyAndRunXTimes(growScript, host, target, 1, ns);
		} else if (ram <= 8) {
			copyAndRunXTimes(hackScript, host, target, 1, ns);
			copyAndRunXTimes(weakenScript, host, target, 1, ns);
			copyAndRunXTimes(growScript, host, target, 2, ns);
		} else if (ram <= 16) { // 16 / 1.75 == 9.14
			copyAndRunXTimes(hackScript, host, target, 2, ns); 
			copyAndRunXTimes(weakenScript, host, target, 1, ns);
			copyAndRunXTimes(growScript, host, target, 6, ns);
		} else if (ram <= 32 ) { // 32 / 1.75 ==
			copyAndRunXTimes(hackScript, host, target, 2, ns);
			copyAndRunXTimes(weakenScript, host, target, 4, ns);
			copyAndRunXTimes(growScript, host, target, 12, ns);
		} else if (ram <= 64 ) {
			copyAndRunXTimes(hackScript, host, target, 3, ns);
			copyAndRunXTimes(weakenScript, host, target, 6, ns);
			copyAndRunXTimes(growScript, host, target, 27, ns);
		} else if (ram <= 128 ) {
			copyAndRunXTimes(hackScript, host, target, 8, ns);
			copyAndRunXTimes(weakenScript, host, target, 15, ns);
			copyAndRunXTimes(growScript, host, target, 50, ns);
		}
	}
	ns.tprint('List of servers already running something: \n' + serversAlreadyRunning);
	ns.tprint('--------------------------------------------------------------------------------');
	ns.tprint('New servers \n' + newServers);
}

function copyAndRunXTimes(scriptName, attacker, target, numberOfTimesToRun, ns) {
	for (let x = 0; x < numberOfTimesToRun; x++) {
		ns.scp(scriptName, attacker);
		let newName = scriptName.replace(/\.[^/.]+$/, "") + x + ".js";
		ns.mv(attacker, scriptName, newName)
		ns.exec(newName, attacker, 1, target);
	}
}

function getNonHackable(ns, listOfServers) {
	if (listOfServers.length === 0) {
		return list;
	}

	for (let x = 0; x < listOfServers.length; x++) {
		let host = listOfServers[x];
		let isHackable = ns.hackAnalyzeChance(host) > 0.3;
		let ram = ns.getServerRam(host)[0]; // returns array, first argument is total ram
		let hasRoot = ns.hasRootAccess(host);
		if (!isHackable && ram > 0 && hasRoot) { 
			nonHackableHosts.push(host);
		}

		let newScan = ns.scan(host);
		newScan.shift();
		if (newScan !== null && newScan.length >= 1 && Object.prototype.toString.call(newScan) === '[object Array]') {
			getNonHackable(ns, newScan);
		}
	}
}

function getHackable(ns, listOfServers) {
	if (listOfServers.length === 0) {
		return list;
	}

	for (let x = 0; x < listOfServers.length; x++) {
		let host = listOfServers[x];
		let isHackable = ns.hackAnalyzeChance(host) > 0.3;
		if (isHackable) { 
			allHosts.push(host);
		}

		let newScan = ns.scan(host);
		newScan.shift();
		if (newScan !== null && newScan.length >= 1 && Object.prototype.toString.call(newScan) === '[object Array]') {
			getHackable(ns, newScan);
		}
	}
}