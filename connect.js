export async function main(ns) {
	if (ns.args.length != 1) {
		ns.tprint("Please specify server you want to connect to.");
	}
	const host = ns.args[0];
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
	ns.tprint("\n" + command);
}