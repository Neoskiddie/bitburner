// first attempt at creating a scan
export async function main(ns) {
	ns.tprint(scanRec(ns, "home"));
}

function scanRec(ns, inputServer) {
	let list = [];
	if (inputServer == null) {
		return list;
	}

	list.push(inputServer); 

	let connectedServers = ns.scan(inputServer);
	connectedServers.shift();
	for (let x = 0; x < connectedServers.length; x++) {
		list.push(scanRec(ns, connectedServers[x]));
	}

	return list;

}