const PubSub = require('pubsub-js');
const logger = require('../utils/logger');

const kafkaLogging = require('kafka-node/logging');

function consoleLoggerProvider (name) {
  // do something with the name
  return {
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
  };
}

kafkaLogging.setLoggerProvider(consoleLoggerProvider);

const kafka = require('kafka-node')
const retry = require('retry');
let ConsumerGroup = kafka.ConsumerGroup

const Consumer = kafka.Consumer;

var options = {
  kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVER, // connect directly to kafka broker (instantiates a KafkaClient)
  batch: undefined, // put client batch settings if you need them
  ssl: false, // optional (defaults to false) or tls options hash
  groupId: process.env.KAFKA_CONSUMER_GROUP_ID,
  sessionTimeout: process.env.KAFKA_CONSUMER_SESSION_TIMEOUT,
  // An array of partition assignment protocols ordered by preference.
  // 'roundrobin' or 'range' string for built ins (see below to pass in custom assignment protocol)
  protocol: [process.env.KAFKA_CONSUMER_PROTOCOL],
  encoding: process.env.KAFKA_CONSUMER_ENCODING, // default is utf8, use 'buffer' for binary data

  // Offsets to use for new groups other options could be 'earliest' or 'none' (none will emit an error if no offsets were saved)
  // equivalent to Java client's auto.offset.reset
  fromOffset: process.env.KAFKA_CONSUMER_FROM_OFFSET, // default
  commitOffsetsOnFirstJoin: process.env.KAFKA_CONSUMER_COMMIT_OFFSET_ON_FIRST_JOIN, // on the very first time this consumer group subscribes to a topic, record the offset returned in fromOffset (latest/earliest)
  // how to recover from OutOfRangeOffset error (where save offset is past server retention) accepts same value as fromOffset
  outOfRangeOffset: process.env.KAFKA_CONSUMER_OUT_OF_RANGE_OFFSET, // default
  // Callback to allow consumers with autoCommit false a chance to commit before a rebalance finishes
  // isAlreadyMember will be false on the first connection, and true on rebalances triggered after that
  onRebalance: (isAlreadyMember, callback) => { callback(); } // or null
};

const consumer = new ConsumerGroup(options, [process.env.KAFKA_PRE_PROC_DONE_TOPIC,process.env.KAFKA_PROC_DONE_TOPIC, process.env.KAFKA_POST_PROC_DONE_TOPIC]);



consumer.on('message', function (message) {
  try{
        logger.info(`Received message ${JSON.stringify(message)} `)
        
        let topic=message.topic;
        let scanTaskId=''
        let internalMessage={};
        switch(topic){
          case process.env.KAFKA_SCAN_TASK_STOP_TOPIC:
            try{
              internalMessage=JSON.parse(message.value);
              scanTaskId=internalMessage.scanTaskId;
            }catch(e){
              logger.error(`error while parsing json`,e);
            }
            break;
          case process.env.KAFKA_SCAN_ENGINE_RUNNER_TOPIC:
            try{
              internalMessage=JSON.parse(message.value);
              scanTaskId=internalMessage.config.scanTaskId;
            }catch(e){
              logger.error(`error while parsing json`,e);
            }
            break;
          case process.env.KAFKA_PRE_PROC_DONE_TOPIC:
            try{

              internalMessage=JSON.parse(message.value);
              scanTaskId=internalMessage.scanTaskId;

              //publish message for project creation
              PubSub.publish('project-creation', internalMessage);

            }catch(e){
              logger.error(`error while parsing json`,e);
            }
            break;  
          case process.env.KAFKA_PROC_DONE_TOPIC:
            try{
              internalMessage=JSON.parse(message.value);
              scanTaskId=internalMessage.scanTaskId;
            }catch(e){
              logger.error(`error while parsing json`,e);
            }
            break;
          case process.env.KAFKA_POST_PROC_DONE_TOPIC:
            //TODO: change logic to parse specific format for the topic
            try{
              internalMessage=JSON.parse(message.value);
              scanTaskId=internalMessage.scanTaskId;
            }catch(e){
              logger.error(`error while parsing json`,e);
            }
            break;
        }

        let scanTaskInternalTopic='status-sse.'+scanTaskId;

        //publish message for scan task
        let countSubscriptionsForScanTask=PubSub.countSubscriptions(scanTaskInternalTopic)
        logger.info(`Publish internally scanTaskId:${scanTaskId} scanTaskInternalTopic:${scanTaskInternalTopic} internalMessage:${JSON.stringify(internalMessage)} subscription count:${countSubscriptionsForScanTask}`)
        PubSub.publish(scanTaskInternalTopic, internalMessage);

        //publish message for file system
        let countSubscriptionsForFileSystem=PubSub.countSubscriptions('status-sse-file-system')
        logger.info(`Publish internally scanTaskId:${scanTaskId} internalTopic:'status-sse-file-system' internalMessage:${JSON.stringify(internalMessage)} subscription count:${countSubscriptionsForFileSystem}`)
        PubSub.publish('status-sse-file-system', internalMessage);

        //publish message for kafka topic
        let countSubscriptionsForKafkaTopic=PubSub.countSubscriptions('kafka.'+topic,internalMessage)
        logger.info(`Publish internally scanTaskId:${scanTaskId} internalTopic:'kafka.${topic}' internalMessage:${JSON.stringify(internalMessage)} subscription count:${countSubscriptionsForKafkaTopic}`)
        PubSub.publish('kafka.'+topic,internalMessage);

      }catch(err){
        logger.error("while processing message"+ err);

      }
});


consumer.on('error', function (err) {
  logger.error("Kafka Consumer encountered error, exit: " + JSON.stringify(err));
  process.exit(1);
});