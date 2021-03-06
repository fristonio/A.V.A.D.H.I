'use strict';
const builder = require('botbuilder');
const commands = require('./commands');

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var users = [];

const bot = module.exports = new builder.UniversalBot(connector, function (session) {
  var reply = '';
  var message = session.message;
  var conversationId = message.address.conversation.id;
  var text = message.text.toLocaleLowerCase();
  var response = []; 
  console.log('[' + conversationId + '] Message received: ' + text);

  switch (text) {
    case 'hi':
    case 'hello':
    case 'hey':
    case 'yo':
      reply = 'Hello there! How can I help you?';
      session.send(reply);
      break;

    case (text.match(/bye/) || {}).input:
      reply="Hasta la vista, See you later!";
      session.send(reply);
      break;

    case (text.match(/time/) || {}).input:
      let now = new Date();
      let options = {  
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      };
      reply = now.toLocaleString('en-us', options);
      session.send('Today is ' + reply);
      break;

    case 'bot stats':
      commands.botStats()
        .then(function (json) {
          json = JSON.parse(json);
          Object.keys(json).forEach(function(k){
            if (json[k].username !== 'Not Registered') {
              response.push(json[k].name + ' - ' + parseInt(json[k].minutes)/60 + ' hours\n');
            }
          });
          reply = response.join('\r\n');
          session.send('Here are the Stats:');
          session.send(reply);
        })
        .catch(function (err) {
            throw err;
        });
      break;

    case 'bot online':
      commands.botOnline()
        .then(function (json) {
          json = JSON.parse(json);
          Object.keys(json).forEach(function(k){
            response.push(json[k].name + '\n');
          });
          reply = response.join('\r\n');
          if (reply === '') {
            session.send('Nobody is here :(');
          } else {
            session.send('Online User:');
            session.send(reply);
          }
        })
        .catch(function (err) {
            throw err;
        });
      break;

    case (text.match(/bot score/) || {}).input:
      commands.botScore(text.split(' ')[2])
        .then(function (data) {
          reply = data[2] + ' hours';
          session.send(reply);
        })
        .catch(function (err) {
            throw err;
        });
      break;

    case (text.match(/help/) || {}).input:
      /* Add Help Here */ 
      break;

    case 'bot users':
      session.send('All Users:');
      reply = users.join('\r\n');
      session.send(reply);
      break;

    default:
      reply = 'Try something else!';
      session.send(reply);
      break;
  }
});

/* Bot Event */
bot.on('conversationUpdate', function (activity) {
    var instructions = 'Welcome! I am your Saathi (the presence bot).';
    // when user joins conversation, send instructions
    if (activity.membersAdded) {
      activity.membersAdded.forEach(function (identity) {
        if (identity.id === activity.address.bot.id) {
          var reply = new builder.Message()
          .address(activity.address)
          .text(instructions);
          bot.send(reply);
          commands.botUsers()
            .then(function (data) {
              data = JSON.parse(data);
              data.forEach(function (user) {
                users.push(user['id'] + '. ' + user['name'] + '\n');
              });
            })
            .catch(function (err) {
                throw err;
            });
        }
      });
    }
});
