// This is an early game script that uses the hacked servers to hack each other for money.
// It tries to use 1:2:10 ratio for hack, weaken and grow respectively.
// On each server hack, grow and weaken scripts are coppied according to ratio and run in a infinite loop.
/** @param {NS} ns */
export async function main(ns) {
	let allServers = scanAll(ns, "home");
	let botnet = []
	if (ns.args.length == 1 && ns.args[0]) {
		//botnet = getBotnet(ns, allServers).filter(name => !name.includes("bot")); // purchased servers have separate script, so don't use them here 
	} else {
		ns.tprintf("You can specify if the script should skip bots by adding `true` as a flag")
		botnet = getBotnet(ns, allServers);
	}

	botnet = getBotnet(ns, allServers);
	let hackable = getHackable(ns, allServers).filter(name => !name.includes("bot"));
	//ns.tprint(botnet);
	//ns.tprint(hackable);

	const hackScript = "hack.js";
	const growScript = "grow.js";
	const weakenScript = "weaken.js";
	const deployDirectory = "/running/"
	const localDirectory = "/deployScripts/"

	let scripts = [];
	scripts.push(localDirectory + hackScript);
	scripts.push(localDirectory + growScript);
	scripts.push(localDirectory + weakenScript);

	cleanAllHosts(ns, deployDirectory, botnet); // Delete old scripts everywhere (and kill them)
	await createScripts(ns);
	//deploy(ns, scripts, botnet);
	await runScriptsOnTheHackableServers(ns, deployDirectory, localDirectory, hackScript, growScript, weakenScript, botnet, hackable);

}

async function runScriptsOnTheHackableServers(
	ns,
	deployDirectory,
	localDirectory,
	hackScript,
	growScript,
	weakenScript,
	bots,
	targets) {

	let currentTargetIndex = 0;
	for (let x = 0; x < bots.length; x++) {
		let attacker = bots[x];
		let target = targets[currentTargetIndex];

		// If currentTargetIndex is beyond targets index, set it to 0
		// so the first one can be hacked again.
		//
		if (currentTargetIndex >= targets.length - 1) {
			currentTargetIndex = 0;
		}

		let ram = ns.getServerMaxRam(attacker); // returns array, first argument is total ram

		// If the ram is smaller then 8 we can't calculate the ratio well
		// The simple scripts take 1.75 RAM. 
		// So for this small servers just run grow and weaken and 
		// don't change the target for next server
		//ns.tprint("Running attack against " + target);
		if (ram <= 4 && ram > 0) { // 4 / 1.75 == 2.28
			//ns.tprint("4 ram called for " + attacker);
			await copyAndRunXTimes(ns, deployDirectory, localDirectory, weakenScript, attacker, target, 1);
			await copyAndRunXTimes(ns, deployDirectory, localDirectory, growScript, attacker, target, 1);
		} else if (ram <= 8) { // 8 / 1.75 == 4.57
			//ns.tprint("8 ram called for " + attacker);
			await copyAndRunXTimes(ns, deployDirectory, localDirectory, weakenScript, attacker, target, 1);
			await copyAndRunXTimes(ns, deployDirectory, localDirectory, growScript, attacker, target, 3);
		} else {
			currentTargetIndex++;
			let ratios = getRatios(ram);
			//ns.tprint("Else called for " + attacker);
			await copyAndRunXTimes(ns, deployDirectory, localDirectory, hackScript, attacker, target, ratios[0]);
			await copyAndRunXTimes(ns, deployDirectory, localDirectory, weakenScript, attacker, target, ratios[1]);
			await copyAndRunXTimes(ns, deployDirectory, localDirectory, growScript, attacker, target, ratios[2]);
		}
	}
}

// this uses ration of 1:2:10
// However when it cannot be divided equaly it will give more into hackin
function getRatios(serverRam) {
	const sumOfRatio = 13;
	const scriptRunningCost = 1.75;
	const numberOfTimesScriptCanBeRun = Math.floor(serverRam / scriptRunningCost);
	const valueOfOneShare = numberOfTimesScriptCanBeRun / sumOfRatio;

	const weakenRatio = Math.floor(valueOfOneShare * 2);
	const growRatio = Math.floor(valueOfOneShare * 10);
	let hackRatio = numberOfTimesScriptCanBeRun - weakenRatio - growRatio;
	//ns.tprint("Hack: " + hackRatio);
	//ns.tprint("Weaken " + weakenRatio);
	//ns.tprint("Grow " + growRatio);

	return [hackRatio, weakenRatio, growRatio];
}

// copy script that already is on the attacker and run it X times with
// target as first argument
async function copyAndRunXTimes(ns, deployDirectory, locaDirectory, scriptName, attacker, target, numberOfTimesToRun) {
		// can't deploy to home this way :(
		// There doesn't seem to be a way to copy on the same host
		// Only mv and scp, so can't run multiple scripts on the same machine it looks like
		if (attacker === "home" || attacker === "first") { 
			return;
		} 

	for (let x = 0; x < numberOfTimesToRun; x++) {
		await ns.sleep(0.001); // Add a  sleep to prevent freezin
		let localPath = locaDirectory + scriptName;
		let newName = deployDirectory + scriptName.replace(/\.[^/.]+$/, "") + x + ".js";
		await ns.scp(localPath, attacker); // there is no ns.cp, so must scp each time then mv
		ns.mv(attacker, localPath, newName);
		ns.exec(newName, attacker, 1, target);
	}
}

function cleanAllHosts(ns, deployDirectory, listOfServers) {
	for (let x = 0; x < listOfServers.length; x++) {
		let host = listOfServers[x];
		
		if (host === "home" || host === "first") { 
			continue;
		} 
		
		rmDirectory(ns, deployDirectory, host);
	}
}

// kill and remove all scripts from the host
// WARNING! This deleted ALL files from the 
// given directory
function rmDirectory(ns, deployDirectory, host) {
	// do NOT remove from home
	if (host === "home" || host === "first") { 
		return;
	} 

	ns.killall(host);
	let listOfScripts = ns.ls(host, deployDirectory) // server
	for (let x = 0; x < listOfScripts.length; x++) {
		ns.rm(listOfScripts[x], host);
	}
}

// get all servers that have root and ram
function getBotnet(ns, listOfServers) {
	let botnet = [];
	for (let x = 0; x < listOfServers.length; x++) {
		let host = listOfServers[x];
		let ram = ns.getServerMaxRam(host); // returns array, first argument is total ram
		let hasRoot = ns.hasRootAccess(host);
		if (ram > 0 && hasRoot) {
			botnet.push(host);
		}
	}

	return botnet;
}

// get all servers that can be hacked for money
function getHackable(ns, listOfServers) {
	let hackable = [];
	const myLevel = ns.getHackingLevel();
	for (let x = 0; x < listOfServers.length; x++) {
		let host = listOfServers[x];
		let hasRoot = ns.hasRootAccess(host);
		let isHackable = ns.getServerRequiredHackingLevel(host) <= myLevel;
		if (isHackable && hasRoot) {
			hackable.push(host);
		} else if (isHackable && !hasRoot) {
			ns.tprint(host + " is hackable, but doesn't have root access!")
		}
	}

	return hackable.filter(i =>
		i !== 'home' &&
		i !== 'first' &&
		i !== 'darkweb'); // filter out my servers and darkweb (cannot be hacked?)
}

// -------------------------------------------------------------------------------- 
// SCAN
// -------------------------------------------------------------------------------- 
function scanAll(ns, inputServer) {
	let list = scanRec(ns, inputServer, true);
	let result = list.join(',').split(',');
	return result;
}

// Recursive function to get all servers.
// The scan usually returns current server as first element.
// That's why the shift() is used to delete the first server
// from the list to avoid infinite loop.
// But this isn't the case with home.
// So to get the full list of the servers from home
// the flag isFirstCall is used.
function scanRec(ns, inputServer, isFirstCall) {
	let list = [];

	list.push(inputServer);
	let connectedServers = ns.scan(inputServer);
	if (!isFirstCall) {
		connectedServers.shift();
	}

	for (let x = 0; x < connectedServers.length; x++) {
		list.push(scanRec(ns, connectedServers[x], false));
	}


	return list;
}

async function createScripts(ns) {
	await ns.write("/deployScripts/hack.js", 
`/** @param {NS} ns */
export async function main(ns) {
	while(true) {
		await ns.hack(ns.args[0]);
	}
}`, "w");

	await ns.write("/deployScripts/grow.js", 
`/** @param {NS} ns */
export async function main(ns) {
	while(true) {
		await ns.grow(ns.args[0]);
	}
}`, "w");

	await ns.write("/deployScripts/weaken.js", 
`/** @param {NS} ns */
export async function main(ns) {
	while(true) {
		await ns.weaken(ns.args[0]);
	}
}`, "w");

}