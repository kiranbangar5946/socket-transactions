const client = require('socket.io').listen(4000).sockets;

const users = [
    {
        name: 'John',
        balance: 3000
    },
    {
        name: 'Bob',
        balance: 2500
    },
    {
        name: 'Vishal',
        balance: 1500
    }
]

// Connect to Socket.io
client.on('connection', (socket) => {
    console.log('Socket connection successfull!')
    // Create function to send status
    sendStatus = (s) => {
        socket.emit('status', s);
    }

    // Handle input events
    socket.on('input', (data) => {
        const { name } = data;

        // Check for name and message
        if (!name) {
            // Send error status
            return sendStatus('Please enter a name and message');
        }
        // Insert message
        client.emit('output', { name, login: true });

        // Send status object
        sendStatus({
            message: 'Logged in successfully',
            clear: true
        });

    });

    // Handle clear
    socket.on('clear', (data) => {
        // Emit cleared
        socket.emit('cleared');
    });

    // Handle check balance
    socket.on('check_balance', (user) => {
        const userData = users.find(u => u.name === user)
        socket.emit('output', { ...userData, check_balance: true });
    });

    // Handle deposit
    socket.on('deposit', (depositRequest) => {
        const index = users.findIndex(u => u.name === depositRequest.name)
        if (index < 0) {
            return socket.emit('output', { message: 'You dont have wallet to deposit:(', deposit: true, wallet: false });
        }
        users[index].balance = users[index].balance + depositRequest.amount
        return socket.emit('output', { balance: users[index].balance, deposit: true, wallet: true });
    });

    // Handle withdraw
    socket.on('withdraw', (withdrawRequest) => {
        const index = users.findIndex(u => u.name === withdrawRequest.name)
        if (index < 0) {
            return socket.emit('output', { message: 'You dont have wallet to withdraw :(', withdraw: true, wallet: false });
        }
        if (users[index].balance < withdrawRequest.amount) {
            return socket.emit('output', { message: 'Insufficient funds', withdraw: true, wallet: true });
        }
        users[index].balance = users[index].balance - withdrawRequest.amount
        return socket.emit('output', { balance: users[index].balance, withdraw: true, wallet: true });
    });
});
