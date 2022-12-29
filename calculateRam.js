/** @param {NS} ns */
export async function main(ns) {
	ns.tprint(getMaxRunsOfScript(ns, ns.args[0]));
}
// this uses ration of 1:2:10
// However when it cannot be divided equaly it will give more into hacking
function getMaxRunsOfScript(ns, serverRam) {
	const sumOfRatio = 13;
	const scriptRunningCost = 1.75;
	const numberOfTimesScriptCanBeRun = Math.floor(serverRam / scriptRunningCost);
	const valueOfOneShare = numberOfTimesScriptCanBeRun / sumOfRatio;

	const weakenRatio = Math.floor(valueOfOneShare * 2);
	const growRatio = Math.floor(valueOfOneShare * 10);
	let hackRatio = numberOfTimesScriptCanBeRun - weakenRatio - growRatio;
	ns.tprint("Hack: " + hackRatio);
	ns.tprint("Weaken " + weakenRatio);
	ns.tprint("Grow " + growRatio);

	return [hackRatio, weakenRatio, growRatio];
}