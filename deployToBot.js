/** @param {NS} ns */
export async function main(ns) {
	const homeDeployScript = "home-deploy.js";
	const createScript = "createScript.js";
	if (ns.args[0] == null) {
		ns.tprint("Pass server to deploy to as first argument");
		return;
	}
	const serverName = ns.args[0];
	if (!ns.serverExists(serverName)) {
		ns.purchaseServer(serverName, 8)
	}
	
	await ns.scp(homeDeployScript, serverName);
	await ns.scp(createScript, serverName);
	ns.exec(createScript, serverName);
	ns.exec(homeDeployScript, serverName);
}