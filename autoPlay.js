/** @param {NS} ns */
// This script tries to automate as much as possible in terms of hacking
// You still need to:
// 1. Buy TOR router
// 2. Buy or create exploits (but this script helps you with command to buy them)
// 3. Backdoor servers - cannot be easily automated in early game
export async function main(ns) {
	const hackScript = "hackAllTheThings.js"; // script that tries to backdoor and nuke all servers
	const homeServer = "home";
	const killAllScript = "killAllRunning.js"; // kill all running scripts except home (bought servers, regular servers)
	const deployToRegularServersScript = "deploy.js"; // run hack, grow, weaken in 1:2:10 ratio on hacked servers 

	const homeDeploy = "deployToHomeFromBot.js"

	const botDeploy = "bot-deploy.js"
	ns.tprintf("Running auto play.\n")

	while (true) {
		ns.tprintf("--------------------------------------------------------------------------------\n")
		ns.tprintf("Running autoPlay scripts...\n")
		const hackingLevel = ns.getHackingLevel();
		await execAsync(ns, hackScript, homeServer, 1);// execute the script on home with one thread;
		await execAsync(ns, killAllScript, homeServer, 1);
		await execAsync(ns, deployToRegularServersScript, homeServer, 1);

		// kill all scripts running on home and deploy to it from a remote server 
		// that is bought automatically, last parameter is name of the server
		ns.killall(homeServer, true);
		await execAsync(ns, botDeploy, homeServer, 1, 1);
		await execAsync(ns, homeDeploy, homeServer, 1, "first", 1);


		ns.tprintf("--------------------------------------------------------------------------------\n")
		// at the beggining of the game sleep for shorter periods of time before running this again
		if (hackingLevel < 50) {
			await sleepMinutes(ns, 1);
		} else {
			await sleepMinutes(ns, 5);
		}

	}
}

// sleep, but for x amount of minutes instead of miliseconds
async function sleepMinutes(ns, minutesToSleep) {
	const time = minutesToSleep * 60000;
	await ns.sleep(time);
}

// Custom exec method that can be awaited
// It sleeps for 1 second if the script is running, until it's finished. 
async function execAsync(ns, filename, hostname, threads, ...args) {
	const pid = ns.exec(filename, hostname, threads, ...args);
	while (ns.isRunning(pid, hostname)) {
		await ns.sleep(100);
	}
	return pid;
	//if (args.length == 0) {
	//	ns.exec(filename, hostname, threads);
	//	while (ns.isRunning(filename, hostname)) {
	//		await ns.sleep(1000);
	//	}
	//} else {
	//	ns.exec(filename, hostname, threads, args[0]);
	//	while (ns.isRunning(filename, hostname, args[0])) {
	//		await ns.sleep(1000);
	//	}
	//}

}