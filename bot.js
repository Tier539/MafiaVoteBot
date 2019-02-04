const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.BOT_TOKEN

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
        '\n\n----- COUNT: number of current votes received, by target ----\n', count)
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
        voted[target][0].active = false
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
        var scores = Object.entries(count).sort((a, b) => a[0] - b[0])

        for (var score of scores) {
            var target = score[0]
            var votee = client.users.get(target).username
            var line = votee + '(' + score[1] + '): '

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
        if (votal) {
            message.channel.send(votal.slice(0, -1))
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
    const command = message.content.split(' ')[0].toLowerCase()

    if (command === '#ping'){
        pong(message)
    }
    if (command === '#debug'){
        debug()
    }
    if (command === '#lynch' || command === '#vote'){
        postVote(message)
    }
    if (command === '#unlynch' || command === '#unvote'){
        deleteVote(message, true)
    }
    if (command === '#votal' || command === '#votes'){
        getVotal(message)
    }
})

client.login(token)
