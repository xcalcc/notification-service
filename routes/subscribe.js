const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

const logger = require('../utils/logger');
const PubSub = require('pubsub-js');

const { v4: uuidv4 } = require('uuid');

const keepaliveInterval = process.env.KEEPALIVE_INTERVAL;

/* API for subscribing with scanTaskId*/
router.get(["/status-sse"], async (req, res) => {
    let sessionId=uuidv4();

    let scanTaskId=req.query.scanTaskId;
    // validate
    if(!scanTaskId){
        logger.info(`[${sessionId}] scanTaskId is not provided`);
        throw 'scanTaskId is not provided';
    }

    // change to array
    let scanTaskArray=null;
    if(!Array.isArray(scanTaskId)){
        scanTaskArray=[scanTaskId];
    }else{
        scanTaskArray=scanTaskId;
    }

    // set to support SSE
    logger.info(`[${sessionId}] /subscribe/status-sse`, scanTaskId);
    const headers={
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    };
    res.writeHead(200,headers);
    res.flush();

    logger.info(`[${sessionId}] start the async function ${scanTaskArray.length}`);
    // send historical status
    for(let i =0;i<scanTaskArray.length;i++){
        
        let currScanTaskId=scanTaskArray[i];
        const statusSseFileName=process.env.STATUS_SSE_FILE_NAME;
        let historicalStatusFilePath=`/data/${currScanTaskId}/${statusSseFileName}`;

        if (fs.existsSync(historicalStatusFilePath)) {
            logger.info(`[${sessionId}] reading from filePath ${historicalStatusFilePath}`);
            const data = await fs.promises.readFile(historicalStatusFilePath, 'utf8');
            let lines=data.split("\n");
            for(let line of lines){
                if(line === ""){ // skip for empty line
                    continue;
                }
                logger.info(`line: ${line}`);
                res.write(`data: ${line}\n\n`);
                res.flush();
            }
        }else{
            logger.info(`[${sessionId}] file does not exist (yet): ${historicalStatusFilePath}`);
        }
        
    }

    // create subscription
    let subscribeHandles=[];
    for(let i=0;i<scanTaskArray.length;i++){
        let currentScanTaskId=scanTaskArray[i];
        let internalTopic='status-sse.'+currentScanTaskId;
        logger.info(`subscribe ${internalTopic}`);
        var handle = PubSub.subscribe(internalTopic, (topic, data)=>{
            logger.info(`[${sessionId}] notify subscriber:${topic} , ${JSON.stringify(data)} `);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
            res.flush();
        }); 
        subscribeHandles.push(handle);
    }  

    //keepalive
    const intervalHandle = setInterval(()=>{
        sendKeepalive(res);
    }, keepaliveInterval );

    // unsuscribe on close
    res.on('close',()=>{
        logger.info(`[${sessionId}] client dropped me`);

        //stop keep alive
        clearInterval(intervalHandle)

        for(let i=0;i<subscribeHandles.length;i++){
            let currentScanTaskHandle=subscribeHandles[i];
            PubSub.unsubscribe(currentScanTaskHandle);
        }
        res.end();
    });

  });
  

  /* API for subscribing with kafkaTopic*/
  router.get("/", async(req, res) => {
    let sessionId=uuidv4();
    let kafkaTopic=req.query.kafkaTopic;

    // validate
    if(!kafkaTopic){
        logger.info(`[${sessionId}] kafkaTopic is not provided`);
        throw 'kafkaTopic is not provided';
    }

    // change to array
    let kafkaTopicArray=null;
    if(!Array.isArray(kafkaTopic)){
        kafkaTopicArray=[kafkaTopic];
    }else{
        kafkaTopicArray=kafkaTopic;
    }

    // set to support SSE
    logger.info(`[${sessionId}] /`, kafkaTopicArray);
    const headers={
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    };
    res.writeHead(200,headers);
    res.flush();
    
    // create subscription
    let subscribeHandles=[];
    for(let i=0;i<kafkaTopicArray.length;i++){
        let currentKafkaTopic=kafkaTopicArray[i];

        let internalTopic='kafka.'+currentKafkaTopic;
        logger.info(`[${sessionId}] subscribe ${internalTopic}`);
        var handle = PubSub.subscribe(internalTopic, (topic, data)=>{
            logger.info(`[${sessionId}] notify subscriber:${topic} , ${JSON.stringify(data)} `);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
            res.flush();
        }); 
        subscribeHandles.push(handle);
    }  

    //keepalive
    const intervalHandle = setInterval(()=>{
        sendKeepalive(res);
    }, keepaliveInterval);

    // unsuscribe on close
    res.on('close',()=>{
        logger.info(`[${sessionId}] client dropped me`);

        //stop keep alive
        clearInterval(intervalHandle)

        for(let i=0;i<subscribeHandles.length;i++){
            let currentScanTaskHandle=subscribeHandles[i];
            PubSub.unsubscribe(currentScanTaskHandle);
        }
        res.end();
    });
    
    

  });
  


module.exports = router;
function sendKeepalive(res) {
    let keepaliveMessage = {
        "source": "NOTI",
        "scanTaskId": "",
        "status": "SUCC",
        "dateTime": Date.now
    };
    res.write(`data: ${JSON.stringify(keepaliveMessage)}\n\n`);
    res.flush();
}

