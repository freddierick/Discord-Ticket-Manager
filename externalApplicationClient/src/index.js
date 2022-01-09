import Client from './Classes/Client.js';


const ticketMaster = new Client();

ticketMaster.on('ready', () => {
    console.log('Ready!', ticketMaster.user.owner);


    ticketMaster.interactions.register({
        name: 'Update donation amount',
        type: 'SINGLE_TEXT_BOX',
        description: 'Enter donations to be added to the user total',
    })

    ticketMaster.interactions.fetch()


    ticketMaster.interactions.update('Interaction ID', {name: "Change the name"});

});

ticketMaster.on('message', (message) => {
    console.log(`New Message from ${message.author.username}: ${message.content}`);
});

ticketMaster.on('interaction', (interaction) => {
    console.log(interaction.name)
});

ticketMaster.on('rawWS', (data) => {
    console.log(data);
});



ticketMaster.login('192.168.0.27:3001', '6554b56591ed09147e0b313201aaaaba1f1a3d67adcc26c75a3d52611742fba060ed9336d25c77d9e74dd1effd4a5c1c');
