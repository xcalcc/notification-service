require('dotenv').config({path: '.env'});
const {version, name} = require('./package.json');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const path = require('path');
const app = express();
const kafkaConsumer= require('./controller/kafkaConsumer');
const PubSub = require('pubsub-js');
const fs = require('fs');

const logMeta = {
    version: `${version}`,
};

const startService = () => {
    app.use(bodyParser.json());

    const router = require('./routes');

    app.use(helmet());
    app.use(compression());
    app.use(cors());
    app.use('/', router);

    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'available',
            service: name,
            version,
        });
    });
    
    logger.info(`environment variables ${JSON.stringify(process.env)}`);

    if (process.env.ENVIRONMENT === 'dev') {
        app.set("view engine", "pug");
        app.set("views", path.resolve(__dirname, "views"));
    }

    var handle = PubSub.subscribe("status-sse-file-system", (topic, data)=>{
        logger.info(`status-sse-file-system topic:${topic} data:${data}`);
        let scanTaskId=data.scanTaskId;
        let folderPath=`/data/${scanTaskId}`;
        const statusSseFileName=process.env.STATUS_SSE_FILE_NAME;
        let filePath=`${folderPath}/${statusSseFileName}`;

        if (!fs.existsSync(folderPath)){
            fs.mkdirSync(folderPath, { recursive: true });
        }

        fs.appendFile(filePath, JSON.stringify(data)+"\n", function (err) {
            if (err) return console.log(err);
          });
    }); 
      

    const port = process.env.PORT || 4004;
    app.listen(port, '0.0.0.0', () => {
        logger.info(`Application started at port:${port}`, logMeta);
    });

    process
    .on('unhandledRejection', (reason, p) => {
        logger.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        logger.error('Unhandled Rejection at Promise', err);
    });

}



startService();
