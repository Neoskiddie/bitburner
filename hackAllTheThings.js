export async function main(ns) {
	let scanResult = await scanAll(ns, "home");
	let shouldSkippRooted = ns.args[0];
	ns.tprint(scanResult);
	await hackAll(ns, scanResult, shouldSkippRooted);
}

async function hackAll(ns, listOfServers, shouldSkippRooted){
	for (let x = 0; x < listOfServers.length; x++) {
		await ns.sleep(0.1);

		let current = listOfServers[x];

		if (shouldSkippRooted && ns.hasRootAccess(current)) {
			ns.tprint("Server " + current + " already has root, skipping")
			continue;
		}
		
		try {
			ns.brutessh(current);
			ns.ftpcrack(current);
			ns.relaysmtp(current);
			ns.httpworm(current);
			ns.sqlinject(current);
			ns.nuke(current);
			if (ns.hasRootAccess(current)) {
				ns.tprint("Gained root on: " + current + "...")
			}
		} catch (error) {
			ns.print("Could not hack: " + current + " the error: " + error);
		}
	}
}

// -------------------------------------------------------------------------------- 
// SCAN
// -------------------------------------------------------------------------------- 
async function scanAll(ns, inputServer) {
	let list = await scanRec(ns, inputServer, true);
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
async function scanRec(ns, inputServer, isFirstCall) {
	let list = [];

	list.push(inputServer); 
	let connectedServers = ns.scan(inputServer);
	if (!isFirstCall){
		connectedServers.shift();
	}

	for (let x = 0; x < connectedServers.length; x++) {
		await ns.sleep(0.1);
		list.push(await scanRec(ns, connectedServers[x], false));
	}


	return list;
}