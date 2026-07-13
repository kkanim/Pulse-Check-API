// This function try to simulate an actual device sending signals to the server
const dotenv = require('dotenv')

dotenv.config({path: './config.env'})


function sendPing(id) {
  const intervalId = setInterval(() => {
    // This tries to create fetch request with the "POST" method to simulate the device sending the ping/heart
    fetch(`http://127.0.0.1:3000/api/v1/monitors/${id}/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.BEARER_TOKEN}` },
    })
      .then((res) => {
        if (res.ok) {
          console.log("Heartbeat sent!");
          return true;
        } else {
          console.log(`Server responded with status of ${res.status}`);
        }
      })
      .catch((err) =>
        console.log(
          `ERROR WHILE SENDING PING FOR DEVICE WITH ID-${id}: ${err}`,
        ),
      );
  }, 5000); // sends a heartbeat to the server after every 10s

  return () => clearInterval(intervalId); // This is to prevent memory leaks
}

module.exports = sendPing;
