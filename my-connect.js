// first attempt at creating a scan
export async function main(ns) {
	ns.tprint(scanRec(ns, "home", ns.args[0]));
}

function scanRec(ns, inputServer, searchedServer) {
	let list = [];
//	if (inputServer === searchedServer) {
//		return list;
//	} else  if (inputServer == null) {
//		return null;
//	}

	list.push(inputServer); 

	let connectedServers = ns.scan(inputServer);
	connectedServers.shift();
	for (let x = 0; x < connectedServers.length; x++) {
		list.push(scanRec(ns, connectedServers[x]));
	}

	return list;

}