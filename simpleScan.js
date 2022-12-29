export async function main(ns) {
	ns.tprint(scanAll(ns, "home"));
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