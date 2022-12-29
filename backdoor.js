export async function main(ns) {
	let allServers = scanAll(ns, "home");

	for (let x = 0; x < allServers.length; x++) {
		let level = ns.getServerRequiredHackingLevel(allServers[x]);
		let hasBackdoor = ns.getServer(allServers[x]).backdoorInstalled
		if (level <= ns.getHackingLevel() && !hasBackdoor) {
			let currentHost = allServers[x];
			//ns.tprint("\n" + currentHost + " has higher hacking level (" + level + ") than you specified.\n")
			//ns.tprint("\nRun following command to backdoor it:\n")
			await getBackdoorCommand(ns, currentHost);
			//ns.tprint("\n")
		}
	}
}

async function getBackdoorCommand(ns, host) {
	if (host == null) {
		ns.tprintf("Please specify server you want to connect to.");
	}
	let serverList = [];

	let currentServer = host;
	while (currentServer != "home") {
		serverList.push(currentServer);
		await ns.sleep(0.1);
		currentServer = getPreviousServer(ns, currentServer);
	}

	serverList.reverse(); // reverse the array - so in the order we want to connect
	printCommand(ns, serverList);
}

function getPreviousServer(ns, host) {
	let scanResult = ns.scan(host);
	return scanResult[0];// first server is always the previous server
}

function printCommand(ns, listOfServers) {

	let command = "home;"; //add home as first command just in case script is run from other server
	for (let x = 0; x < listOfServers.length; x++) {
		let server = listOfServers[x];
		command += "connect " + server + ";";
	}
	ns.tprintf(command + "backdoor");
}


// simple scan that returns all servers as a list 
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
	if (!isFirstCall){
		connectedServers.shift();
	}

	for (let x = 0; x < connectedServers.length; x++) {
		list.push(scanRec(ns, connectedServers[x], false));
	}


	return list;
}