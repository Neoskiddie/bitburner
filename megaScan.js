// Simple scan formatted with visual depth of scan
export async function main(ns) {
	ns.tprint(scanRec(ns, "home", 0, true));
}

function scanRec(ns, inputServer, depth, isFirstCall) {
	let list = [];
	if (inputServer == null) {
		return list;
	}

	let hasBackdoor = ns.getServer(inputServer).backdoorInstalled;

	let indentation = '-'.repeat(depth)
	list.push(inputServer + "\n"); 
	list.push("--Hops: " + depth + "\n");
	list.push("--Root Access: ");
	list.push(ns.hasRootAccess(inputServer) ? "YES\n" : "NO\n")
	list.push("--Backdoor: ");
	list.push(hasBackdoor ? "YES\n" : "NO\n")
	list.push("--Required hacking skill: " + ns.getServerRequiredHackingLevel(inputServer) + "\n");
	list.push("\n")
	depth++;
	
	let connectedServers = ns.scan(inputServer);
	if (!isFirstCall) {
		connectedServers.shift();
	}
	for (let x = 0; x < connectedServers.length; x++) {
		list.push(scanRec(ns, connectedServers[x], depth, false));
	}

	return list.join('');
}