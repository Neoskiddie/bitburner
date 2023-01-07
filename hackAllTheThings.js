export async function main(ns) {
	let scanResult = await scanAll(ns, "home");
	//ns.tprint(scanResult);
	await hackAll(ns, scanResult);
}

async function hackAll(ns, listOfServers){
	const ssh = "BruteSSH.exe";
	const ftp = "FTPCrack.exe";
	const http = "HTTPWorm.exe";
	const sql = "SQLInject.exe";
    const smtp = "relaySMTP.exe";

	const hasSshExploit = doesFileExist(ns, ssh);
	const hasFtpExploit = doesFileExist(ns, ftp);
	const hasHttpExploit = doesFileExist(ns, http); 
	const hasSqlExploit = doesFileExist(ns, sql);
	const hasSmtpExploit = doesFileExist(ns, smtp);

	const buySsh = "buy BruteSSH.exe;"
	const buyFtp = "buy FTPCrack.exe;"
	const buySmtp = "buy relaySMTP.exe;"
	const buyHttp = "buy HTTPWorm.exe;"
	const buySql = "buy SQLInject.exe;"

	let exploitsToBuy = []
	if (!hasSshExploit) {
		exploitsToBuy.push(buySsh);
	}

	if (!hasFtpExploit) {
		exploitsToBuy.push(buyFtp);
	}

	if (!hasSmtpExploit) {
		exploitsToBuy.push(buySmtp);
	}

	if (!hasHttpExploit) {
		exploitsToBuy.push(buyHttp);
	}

	if (!hasSqlExploit) {
		exploitsToBuy.push(buySql);
	}

	let listOfAlreadyRooted = [];
	let listOfNewlyRooted = [];
	for (let x = 0; x < listOfServers.length; x++) {
		await ns.sleep(0.1);

		let current = listOfServers[x];

		if (ns.hasRootAccess(current)) {
			listOfAlreadyRooted.push(current);
			continue;
		}
		
		try {
			//ns.tprintf("try called");
			if (hasSshExploit) {
				ns.brutessh(current);
				//ns.tprintf("ssh called");
			}
			
			if (hasFtpExploit) {
				ns.ftpcrack(current);
				//ns.tprintf("ftp called");
			}

			if (hasHttpExploit) {
				ns.httpworm(current);
				//ns.tprintf("http called");
			}

			if (hasSqlExploit) {
				ns.sqlinject(current);
				//ns.tprintf("sql called");
			}

			if (hasSmtpExploit) {
				ns.relaysmtp(current);
				//ns.tprintf("smtp called");
			}

			ns.nuke(current);

			if (ns.hasRootAccess(current)) {
				listOfNewlyRooted.push(current);
			}
		} catch (error) {
			ns.print("Could not hack: " + current + " the error: " + error);
		}
	}

	ns.tprintf(listOfAlreadyRooted.length + " servers already have root. Check log to see full list");
	ns.print(listOfAlreadyRooted);
	ns.tprintf("Gained root on: " + listOfNewlyRooted);
	
	if (!ns.hasTorRouter()) {
		ns.tprintf("You don't have TOR router! You must buy it first before buying exploits\n")
	}
	
	if(exploitsToBuy.length > 0) {
		ns.tprintf("You don't have all exploits! Use following command to try to buy them:\n")
		inputCommands(ns, exploitsToBuy.join(''));
	}
}

function doesFileExist(ns, file) {
	let listOfFiles =  ns.ls("home", file);
	return listOfFiles != "";
}

// -------------------------------------------------------------------------------- 
// SCAN
// -------------------------------------------------------------------------------- 
async function scanAll(ns, inputServer) {
	let list = await scanRec(ns, inputServer, true);
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
async function scanRec(ns, inputServer, isFirstCall) {
	let list = [];

	list.push(inputServer); 
	let connectedServers = ns.scan(inputServer);
	if (!isFirstCall){
		connectedServers.shift();
	}

	for (let x = 0; x < connectedServers.length; x++) {
		await ns.sleep(0.1);
		list.push(await scanRec(ns, connectedServers[x], false));
	}


	return list;
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