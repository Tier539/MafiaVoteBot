const Discord = require('discord.js')
const client = new Discord.Client()

const TOKEN = process.env.BOT_TOKEN
const PREFIX = '#'
const CONSOLE = '456642858036887563'

var votes = {}  //all votes cast, by source
var voted = {}  //all votes received, by target
var count = {}  //number of current votes received, by target

function pong(message){
    console.log(client.pings)
    message.channel.send('Pong! (' + parseInt(client.ping) + 'ms)')
}

function debug(){
    console.log('========================= DEBUGGING =========================',
            '\n\n----- VOTES: all votes cast, by source ----------------------\n', votes, 
            '\n\n----- VOTED: all votes received, by target ------------------\n', voted, 
            '\n\n----- COUNT: number of current votes received, by target ----\n', count,
            '\n\n=============================================================\n\n')
}

function reset(message){
    votes = {}
    voted = {}
    count = {}
    message.channel.send('All votes reset!')
}

function getHelp(message){
    message.channel.send(`**VotalBot Commands**\n`
                        + '`.lynch @target` to vote, \n'
                        + '`.unlynch` to unvote, \n'
                        + '`.votal` to see votal')
}

function postVote(message){
    try {
        const source = message.author.id
        const target = message.mentions.users.first().id
        const ballot = {
            'active': true,
            'source': source
        }
        if (source in votes && votes[source] && votes[source][0] === target){
            message.channel.send('Duplicate vote!')
        }
        else {
            deleteVote(message, false)

            votes[source] = [target].concat(source in votes ? votes[source] : [])
            voted[target] = [ballot].concat(target in voted ? voted[target] : [])
            count[target] = (target in count ? count[target] : 0) + 1

            const voter = client.users.get(source).username
            const votee = client.users.get(target).username
            message.channel.send(voter + ' voted for ' + votee)
        }
    }
    catch(err) {
        console.log(err.message)
        message.channel.send('Invalid user!')
    }
}

function deleteVote(message, verbose){
    const source = message.author.id
    const target = source in votes ? votes[source][0] : false

    if (target) {
        votes[source] = [false].concat(votes[source])

        var ballot = voted[target].find(b => b.active === true && b.source === source);
        ballot.active = false

        count[target] -= 1

        if (verbose) {
            const voter = client.users.get(source).username
            const votee = client.users.get(target).username
            message.channel.send(voter + ' has removed their vote from ' + votee) 
        }
    }
    else {
        if (verbose) message.channel.send('You have no active vote to remove!') 
    }
}

function getVotal(message){
    try {
        var votal = ''
        var scores = Object.entries(count).sort((a, b) => a[1] - b[1]).reverse()

        for (var score of scores) {
            var target = score[0]
            var votee = String(client.users.get(target).username)
            var line = '(' + score[1] + ') ' + votee + ' ← '

            for (var i = 0; i < voted[target].length; i++) {
                var ballot = voted[target][i]
                var voter = client.users.get(ballot.source).username

                if (ballot.active) {
                    line += voter + ', '
                }
                else {
                    line += '~~' + voter + '~~, '
                }
            }
            votal += line.slice(0, -2) + '\n'
        }

        console.log(votal)

        if (votal) {
            const embed = new Discord.RichEmbed()
                //.setTitle(')
                //.setAuthor("STREET CRIME", "https://i.imgur.com/UPhv5UW.png")
                .setAuthor('══════════ CURRENT VOTES ══════════')
                .setColor(0x00AE86)
                .setDescription(votal)
                //.setFooter('footer', "http://i.imgur.com/w1vhFSR.png")
                //.setImage('http://i.imgur.com/yVpymuV.png')
                //.setThumbnail('https://i.imgur.com/vaKHxja.png')
                .setTimestamp()
                //.setURL('https://ffa.fyi')
                //.addField('title', votal)
                //.addField('title', 'inline', true)
                //.addBlankField(true)
             
            message.channel.send({embed})
        }
        else {
            message.channel.send('No votes recorded yet!')
        }
    }
    catch(err) {
        console.log(err.message)
    }
}

client.on('ready', () => {
  console.log('VotalBot is ready!')
})

client.on('message', message => {
    if (message.content.startsWith(PREFIX)) {
        const command = message.content.split(' ')[0].toLowerCase().slice(1)
        console.log(command)

        if (command === 'ping') { 
            pong(message) 
        }
        if (command === 'debug') { 
            debug() 
        }
        if (command === 'help') { 
            getHelp(message) 
        }
        if (command === 'Darkus') { 
        message.channel.send('If Darkus drove a truck, it would be a Dodge')    
        }        
        if (command === 'lynch' || command === 'vote') { 
            postVote(message) 
        }
        if (command === 'unlynch' || command === 'unvote') { 
            deleteVote(message, true) 
        }
        if (command === 'votal' || command === 'votes') { 
            getVotal(message) 
        }    

        if (message.channel.id === CONSOLE ) {
            if (command === 'test') { 
                message.channel.send('Success!') 
            }
            if (command === 'reset') { 
                reset(message) 
            }
        }
    }
})

client.login(TOKEN)
