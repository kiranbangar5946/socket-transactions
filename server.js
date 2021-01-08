const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

// Connect to mongo
mongo.connect('mongodb://127.0.0.1/simplechat', (err, db) => {
    if (err) {
        throw err;
    }

    console.log('MongoDB connected...');

    // Connect to Socket.io
    client.on('connection', (socket) => {
        const chat = db.collection('chats');

        // Create function to send status
        sendStatus = (s) => {
            socket.emit('status', s);
        }

        // Get chats from mongo collection
        chat.find().limit(50).sort({ _id: 1 }).toArray((err, messages) => {
            if (err) {
                throw err;
            }

            // Emit the messages
            socket.emit('output', messages);
        });

        // Handle input events
        socket.on('input', (data) => {
            const { name, message } = data;

            // Check for name and message
            if (!name || !message) {
                // Send error status
                return sendStatus('Please enter a name and message');
            }
            // Insert message
            chat.insert({ name, message }, () => {
                client.emit('output', [data]);

                // Send status object
                sendStatus({
                    message: 'Message sent',
                    clear: true
                });
            });

        });

        // Handle clear
        socket.on('clear', (data) => {
            // Remove all chats from collection
            chat.remove({}, () => {
                // Emit cleared
                socket.emit('cleared');
            });
        });
    });
});