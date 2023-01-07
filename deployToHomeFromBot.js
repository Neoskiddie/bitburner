/** @param {NS} ns */
export async function main(ns) {
	ns.tprintf("You should manually run 'killall' before funning this script!")
	const homeDeployScript = "home-deploy.js";
	const createScript = "createScripts.js";
	if (ns.args[0] == null) {
		ns.tprintf("Pass server to deploy to as first argument");
		return;
	}

	if (ns.args[1] == null) {
		ns.tprintf("Pass number of threads for home script as second argument");
		return;
	}
	const serverName = ns.args[0];
	if (!ns.serverExists(serverName)) {
		ns.purchaseServer(serverName, 8)
	}
	
	await ns.scp(homeDeployScript, serverName);
	await ns.scp(createScript, serverName);
	await execAsync(ns, createScript, serverName);
	await execAsync(ns, homeDeployScript, serverName, 1, ns.args[1]); 
}


// Custom exec method that can be awaited
// It sleeps for 1 second if the script is running, until it's finished. 
async function execAsync(ns, filename, hostname, threads, ...args) {
	const pid = ns.exec(filename, hostname, threads, ...args);
	while (ns.isRunning(pid, hostname)) {
		await ns.sleep(100);
	}
	return pid;
}