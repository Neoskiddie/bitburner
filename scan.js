export async function main(ns) {
	ns.tprint(scanRec(ns, "home", 0));
}

function scanRec(ns, inputServer, depth) {
	let list = [];
	if (inputServer == null) {
		return list;
	}

	list.push(inputServer + ','); 
	depth++;
	
	let connectedServers = ns.scan(inputServer);
	connectedServers.shift();
	for (let x = 0; x < connectedServers.length; x++) {
		list.push(scanRec(ns, connectedServers[x], depth));
	}

	return list.join('').split(',');
}