/** @param {NS} ns */
export async function main(ns) {
	let allServers = scanAll(ns, "home");
	let botnet = ["home"];
	let hackable = getHackable(ns, allServers);
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

	//cleanAllHosts(ns, deployDirectory, botnet); // Delete old scripts everywhere (and kill them)
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

	let attacker = bots[0];
	let ram = ns.getServerMaxRam(attacker) - 16; // leave some ram for running scripts on home

	const sumOfRatio = 13;
	const scriptRunningCost = 1.75;
	const numberOfTimesScriptCanBeRun = Math.floor(ram / scriptRunningCost);
	const maxRunningPerTarget = Math.floor(numberOfTimesScriptCanBeRun / targets.length);
	const valueOfOneShare = maxRunningPerTarget / sumOfRatio

	const weakenRatio = Math.floor(valueOfOneShare * 2);
	const growRatio = Math.floor(valueOfOneShare * 10);
	const hackRatio = maxRunningPerTarget - weakenRatio - growRatio

	for (let x = 0; x < targets.length; x++) {
		let target = targets[x];

		// for home just run the ratio for each server
		//ns.tprint("Running attack against " + target);
		await copyAndRunXTimes(ns, deployDirectory, localDirectory, hackScript, attacker, target, hackRatio);
		await copyAndRunXTimes(ns, deployDirectory, localDirectory, weakenScript, attacker, target, weakenRatio);
		await copyAndRunXTimes(ns, deployDirectory, localDirectory, growScript, attacker, target, growRatio);
	}
}

// copy script that already is on the attacker and run it X times with
// target as first argument
async function copyAndRunXTimes(ns, deployDirectory, locaDirectory, scriptName, attacker, target, numberOfTimesToRun) {
	// can't deploy to home this way :(
	// There doesn't seem to be a way to copy on the same host
	// Only mv and scp, so can't run multiple scripts on the same machine it looks like

	for (let x = 0; x < numberOfTimesToRun; x++) {
		await ns.sleep(0.001); // Add a 1s sleep to prevent freezing
		let localPath = locaDirectory + scriptName;
		let newName = deployDirectory + scriptName.replace(/\.[^/.]+$/, "") + "-" + target + "-" + x + ".js";
		await ns.scp(localPath, attacker); // there is no ns.cp, so must scp each time then mv
		ns.mv(attacker, localPath, newName);
		ns.exec(newName, attacker, 1, target);
	}
}

function cleanAllHosts(ns, deployDirectory, listOfServers) {
	for (let x = 0; x < listOfServers.length; x++) {
		let host = listOfServers[x];
		rmDirectory(ns, deployDirectory, host);
	}
}

// kill and remove all scripts from the host
// WARNING! This deleted ALL files from the 
// given directory
function rmDirectory(ns, deployDirectory, host) {
	// do NOT remove from home
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