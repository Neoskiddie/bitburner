export async function main(ns) {
	if (ns.args.length != 1) {
		ns.tprintf("Please specify server you want to connect to.");
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
	inputCommands(ns, getCommand(ns, serverList));
}

function getPreviousServer(ns, host) {
	let scanResult = ns.scan(host);
	return scanResult[0];// first server is always the previous server
}

function getCommand(ns, listOfServers) {

	let command = "home;"; //add home as first command just in case script is run from other server
	for (let x = 0; x < listOfServers.length; x++) {
		let server = listOfServers[x];
		command += "connect " + server + ";";
	}
	return command;
}

// hacky bit of JS, only part of code not written by me
// found on https://www.reddit.com/r/Bitburner/comments/sljpi4/got_bored_to_buy_the_scripts_after_a_reset/
// It doesn't entirely work in Steam version - cannot enter.
// But it at least outputs straight to terminal
function inputCommands(ns, input) {
	let terminalInput = ''
	eval('terminalInput = document.getElementById("terminal-input")')
	if (! terminalInput) {
		ns.toast('!!! You need to be in terminal window !!!', 'error')
		return ;
	}

	terminalInput.value = input;
	const handler = Object.keys(terminalInput)[1];
	terminalInput[handler].onChange({ target: terminalInput });
	terminalInput[handler].onKeyDown({ keyCode: 13, preventDefault: () => null });
}