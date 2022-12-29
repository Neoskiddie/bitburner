## Bitbrner scripts

My collection of scripts for Bitburner game. Most of this scripts are't optimised in any way and were written just to get the job done. 
I've treated this as an exercise so all of them are written from scratch

 * formattedScan.js - returns a list of all servers with depth shown by dashes
 * connect.js - takes one argument which is the name of the server and returns a command to connect to it
 * hackAllTheThings.js - tries to run NUKE.exe on every server. It assumes that all exploits are available, but this can be commented out at the beginning of the game.
 * deploy.js - main script used for generating money - looks for servers with available ram and runs infinite hack(), weaken() and grow() on them for list of hackable servers. The ratio used is 1:2:10 for hack, weaken and grow, but hack is prefered when the ration cannot be split equaly.
 * home-deploy.js - very similar to deploy.js but used to run for home. It MUST be run from other host. This can be done with deployToBot.js
 * deployToBot.js - used to purchase a server and run home-deploy.js from there
