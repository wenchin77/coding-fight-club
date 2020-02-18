// send ajax to server every 10 sec to get realtime online users
const token = localStorage.getItem('token');

const ping = async (token) => {
  await axios.post(`/api/v1/user/ping?token=${token}`);
}

setInterval(() => {
  ping(token);
}, 10000);