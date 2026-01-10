const mongoose = require("./mongo");

const AttackSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  service: String,              // web / api
  ip: String,
  method: String,
  endpoint: String,
  payload: mongoose.Schema.Types.Mixed,
  attack_type: String,          // SQL Injection
  user_agent: String
}, { versionKey: false });

module.exports = mongoose.model("attacks", AttackSchema);

