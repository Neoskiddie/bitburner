// Simple scan formatted with visual depth of scan
export async function main(ns) {
	ns.tprint("You can specify level of server (hacking skill required) to search for.");
	ns.tprint("First arg is beginning of range, second end");
	const start = ns.args[0];
	const end = ns.args[1];
	ns.tprint(scanRec(ns, "home", 0, true, start, end));
}

function scanRec(ns, inputServer, depth, isFirstCall, start, end) {
	let list = [];
	if (inputServer == null) {
		return list;
	}
	let hackingLevel = ns.getServerRequiredHackingLevel(inputServer);
	if (start != null &&
	 	end != null &&
		hackingLevel >= start &&
		hackingLevel <= end) {

		let ram = ns.getServerMaxRam(inputServer);
		let hasBackdoor = ns.getServer(inputServer).backdoorInstalled;
		list.push(inputServer + "\n"); 
		list.push("--Hops: " + depth + "\n");
		list.push("--RAM: " + ram + "GB\n");
		list.push("--Root Access: ");
		list.push(ns.hasRootAccess(inputServer) ? "YES\n" : "NO\n")
		list.push("--Backdoor: ");
		list.push(hasBackdoor ? "YES\n" : "NO\n")
		list.push("--Required hacking skill: " + hackingLevel + "\n");
		list.push("\n")
	}
		depth++;
	
	let connectedServers = ns.scan(inputServer);
	if (!isFirstCall) {
		connectedServers.shift();
	}
	for (let x = 0; x < connectedServers.length; x++) {
		list.push(scanRec(ns, connectedServers[x], depth, false, start, end));
	}

	return list.join('');
}