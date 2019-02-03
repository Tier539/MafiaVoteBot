const Discord = require('discord.js')
const client = new Discord.Client()
const token = process.env.BOT_TOKEN

var votes = {}  //all votes cast, by source
var voted = {}  //all votes received, by target
var count = {}  //number of current votes received, by target

function debug(){
    console.log('========================= DEBUGGING =========================',
        '\n\n----- VOTES: all votes cast, by source ----------------------\n', votes, 
        '\n\n----- VOTED: all votes received, by target ------------------\n', voted, 
        '\n\n----- COUNT: number of current votes received, by target ----\n', count)
}

function postVote(message){
    try {
        const source = client.users.get(message.author.id).username
        const target = client.users.get(message.content.split(' ')[1].slice(2, -1)).username

        votes[source] = [target].concat(source in votes ? votes[source] : [])
        voted[target] = [source].concat(target in voted ? voted[target] : [])
        count[target] = (target in count ? count[target] : 0) + 1

        message.channel.send(source + ' voted for ' + target)
    }
    catch(err) {
        console.log(err.message)
        message.channel.send('Invalid user!')
    }
}

function deleteVote(message, verbose){
    const source = client.users.get(message.author.id).username
    const target = source in votes ? votes[source][0] : false

    if (target) {
        votes[source][0] = '~~' + target + '~~'
        voted[target][voted[target].indexOf(source)] = '~~' + source + '~~'
        count[target] -= 1

        if (verbose) message.channel.send(source + ' has removed their vote from ' + target) 
    }
    else {
        if (verbose) message.channel.send('You have no vote to remove!') 
    }
}

function getVotal(message){
    try {
        var votal = ''

        for (var target in voted){
            var line = target + '(' + count[target] + '): '
            for (let source in voted[target]){
                line += voted[target][source] + ', '
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
    const command = message.content.split(' ')[0]

    if (command === '#debug'){
        debug()
    }
    if (command === '#lynch' || command === '#vote'){
        deleteVote(message, false)
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
