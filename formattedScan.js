// Simple scan formatted with visual depth of scan
export async function main(ns) {
	ns.tprint(scanRec(ns, "home", 0, true));
}

function scanRec(ns, inputServer, depth, isFirstCall) {
	let list = [];
	if (inputServer == null) {
		return list;
	}

	let indentation = '-'.repeat(depth)
	list.push(indentation + inputServer + '\n'); 
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