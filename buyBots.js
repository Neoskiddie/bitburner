/** @param {NS} ns */
export async function main(ns) {
	//let maxRam = ns.getPurchasedServerMaxRam();
	//let cost = ns.getPurchasedServerCost(maxRam);

	let allServers = scanAll(ns, "home");
	//let bots = allServers.filter(name => name.includes("bot"));
	const maxNumberOfServers = ns.getPurchasedServerLimit();

	let myMoney = ns.getServerMoneyAvailable("home");
	if (myMoney < 150000000) {
		ns.tprintf("Not enough money to buy servers. Wait until you have 150m at least.")
		return;
	}
	const pricePerGBOfRam = 55000;
	//const numberOfServersToBuy = maxNumberOfServers - bots.length;
	const numberOfServersToBuy = maxNumberOfServers;
	let maxGBOfRam = myMoney / pricePerGBOfRam;
	let ramPerServer = nearestPowerOfTwo(maxGBOfRam / numberOfServersToBuy);

	//ns.tprint(bots.length);

	// Buy max out servers. 
	// It finds out how many were already bought and buys more until the limit
	// It assumes all bots are named bot0, bot1 etc
	//for (let x = bots.length; x < maxNumberOfServers; x++) {
	for (let x = 0; x < maxNumberOfServers; x++) {
		//ns.purchaseServer("bot" + x, maxRam);
		const botName = "bot" + x;
		if (ns.serverExists(botName) && ns.getServerMaxRam(botName) < ramPerServer) {
			ns.upgradePurchasedServer(botName, ramPerServer);
		} else {
			ns.purchaseServer(botName, ramPerServer);
		}
	}
}

// get nearest power of 2 for RAM
// https://stackoverflow.com/questions/26965171/fast-nearest-power-of-2-in-javascript
function nearestPowerOfTwo(n) {
  return 1 << 31 - Math.clz32(n);
}

// simple scan that returns all servers as a list 
function scanAll(ns, inputServer) {
	let list = scanRec(ns, inputServer, true);
	let result = list.join(',').split(',');
	return result;
}

// Recursive function to get all servers.
// The scan usually returns current server as first element.
// That's why the shift() is used to delete the first server
// from the list to avoid infinite loop.
// But this isn't the case with home.
// So to get the full list of the servers from home
// the flag isFirstCall is used.
function scanRec(ns, inputServer, isFirstCall) {
	let list = [];

	list.push(inputServer); 
	let connectedServers = ns.scan(inputServer);
	if (!isFirstCall){
		connectedServers.shift();
	}

	for (let x = 0; x < connectedServers.length; x++) {
		list.push(scanRec(ns, connectedServers[x], false));
	}


	return list;
}