const app = require("../../app");
const errors = require("../../util/errors");
const env = process.env.NODE_ENV || "development";
const { truncateFakeData, createFakeData } = require("../fake_data_generator");

const io = require('socket.io-client');
const socketio = require("socket.io");

let socket;
let ioServer;
let testServer;

beforeAll(async (done) => {
  console.log("Start socket_test.js");
  if (env !== "test") {
    throw "not in test env";
  }
  await truncateFakeData();
  await createFakeData();

  // setup socket server
  testServer = app.listen(3001, () => {
    console.log('Test server running on port 3001...');
  })
  ioServer = socketio.listen(testServer);
  done();
});

afterAll((done) => {
  ioServer.close();
  testServer.close();
  console.log('Server & client io closed!')
  done();
});

beforeEach((done) => {
  // setup socket client
  socket = io.connect("localhost:3001", {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket'],
    query: 'test1accesstoken'
  });
  console.log('connecting socket...')
  socket.on('connect', () => {
    console.log('socket connected!')
    done();
  });
});

afterEach((done) => {
  if (socket.connected) {
    socket.disconnect();
  }
  console.log('socket disconnected!')
  done();
});


// can use socket in socket.js to test???
describe('socket.io test', () => {
  const testOnlineUsers = new Map();
  testOnlineUsers.set(1, { 
    username: 'test1', 
    time: Date.now() - 1000, 
    inviting: 0,
    invitation_accepted: 0, 
    invited: []
  })
  test('should get user count', (done) => {
    // socket.emit('userCount')
    ioServer.emit('count', testOnlineUsers.size);
    
    socket.on('count', (num) => {
      expect(num).toBe(testOnlineUsers.size);
      done();
    })

    ioServer.on('connection', async (mySocket) => {
      mySocket.on("userCount", () => {
        socket.emit("count", testOnlineUsers.size);
      });
    })
  });

  // test('should communicate', (done) => {
  //   // once connected, emit Hello World
  //   ioServer.emit('echo', 'Hello World');
  //   socket.once('echo', (message) => {
  //     // Check that the message matches
  //     expect(message).toBe('Hello World');
  //     done();
  //   });
  //   ioServer.on('connection', (mySocket) => {
  //     expect(mySocket).toBeDefined();
  //   });
  // });
  // test('should communicate with waiting for socket.io handshakes', (done) => {
  //   // Emit sth from Client do Server
  //   socket.emit('examlpe', 'some messages');
  //   // Use timeout to wait for socket.io server handshakes
  //   setTimeout(() => {
  //     // Put your server side expect() here
  //     done();
  //   }, 50);
  // });
});