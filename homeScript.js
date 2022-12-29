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
		} else if (ram <= 16) {
			copyAndRunXTimes(hackScript, host, target, 1, ns);
			copyAndRunXTimes(weakenScript, host, target, 1, ns);
			copyAndRunXTimes(growScript, host, target, 6, ns);
		} else if (ram <= 32 ) {
			copyAndRunXTimes(hackScript, host, target, 1, ns);
			copyAndRunXTimes(weakenScript, host, target, 2, ns);
			copyAndRunXTimes(growScript, host, target, 10, ns);
		} else if (ram <= 64 ) {
			copyAndRunXTimes(hackScript, host, target, 2, ns);
			copyAndRunXTimes(weakenScript, host, target, 4, ns);
			copyAndRunXTimes(growScript, host, target, 20, ns);
		} else if (ram <= 128 ) {
			copyAndRunXTimes(hackScript, host, target, 4, ns);
			copyAndRunXTimes(weakenScript, host, target, 8, ns);
			copyAndRunXTimes(growScript, host, target, 40, ns);
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

function getHackable(ns, listOfServers) {
	let listOfServers = scanAll(ns, "home");
	let hackableServers = [];

	for (let x = 0; x < listOfServers.length; x++) {
		let host = listOfServers[x];
		let isHackable = ns.hackAnalyzeChance(host) > 0.1;
		if (isHackable) { 
			hackableServers.push(host);
		}
	}
}

// simple scan that returns all servers as a list 
function scanAll(ns, inputServer) {
	let list = scanRec(ns, inputServer);
	let result = list.join(',').split(',');
	return result;
}

function scanRec(ns, inputServer) {
	let list = [];

	list.push(inputServer); 

	let connectedServers = ns.scan(inputServer);
	connectedServers.shift();
	for (let x = 0; x < connectedServers.length; x++) {
		list.push(scanRec(ns, connectedServers[x]));
	}

	return list;
}