const Discord = require('discord.js');
const client = new Discord.Client();
const token = '';
var votes = {};
var voterecord = {};

client.on('ready', () => {
  console.log('I am ready!');
});

function objToString (obj,votes) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + ' voted for ' + obj[p]+' ('+votes[obj[p]] + ') \n';
        }
    }
    return str;
}

client.on('message', message => {
	if (message.content.substring(0, 6) === '#lynch') {
		var args = message.content.substring(1).split(' ');
		let id = args[1].replace(/[<@!>]/g, '');
		var votetarget = client.users.get(id);
		var votesenderid = message.author.id;
		var votesender = client.users.get(votesenderid);
		votes[voterecord[votesender]] -= 1;
		voterecord[votesender]=votetarget;
		var y = votes.hasOwnProperty(votetarget);
		if (!y){
			votes[votetarget] = 1;
		}
		else {
			votes[votetarget] += 1;
		}
		message.channel.send(votetarget+' has been voted for by '+votesender);	
  }  
  if (message.content.substring(0, 6) === '#votes'){
	  message.channel.send("votes:\n" +objToString(voterecord,votes));
  }
  if (message.content.substring(0, 8) === '#unlynch'){
	var votesender = client.users.get(message.author.id);
	message.channel.send(votesender + "has removed their vote");	
	votes[voterecord[votesender]] -= 1;
	voterecord[votesender]="Unlynch";
  }
});

client.login(token);
