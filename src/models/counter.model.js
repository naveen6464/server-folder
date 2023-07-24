/** ***************** package Import ******************************************************** */

const mongoose = require("mongoose");

/*  
 counterSchema  - It is the schema for our counter module to autoincrement id's
*/
const Counter = mongoose.Schema({
  /* key_name is unique for each collections
  collections           keyName              value(count of document in collection)
    users                 users                     ex. 3
    pillars               pillars                   ex. 20
    goals                 goals                     ex. 30
    projects              projects                  ex. 20
    requests              requests                  ex. 15
    approvedRequests     approvedRequests          ex. 10
    sponsorsDetails      sponsorsDetails          ex. 5
  */
  keyName: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    default: 0,
  },
});
module.exports = mongoose.model("counters", Counter);
