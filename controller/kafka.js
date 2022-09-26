const { Kafka } = require('kafkajs')

// This creates a client instance that is configured to connect to the Kafka broker provided by
// the environment variable KAFKA_BOOTSTRAP_SERVER
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
brokers:[process.env.KAFKA_BOOTSTRAP_SERVER],
  retries: process.env.KAFKA_BROKER_RETRIES,
  initialRetryTime:process.env.KAFKA_BROKER_INITIAL_RETRY_TIME
})

module.exports = kafka