# Notification-service

A service to forward the message to interested party in the pub/sub mode:
- Accept Request from publisher and put message to Kafka (Not require for 2.1)
- Notify latest status to subscriber once update received from Kafka
- Store and provide data when interested party query after status is already notified in the past?
 - May store latest status.
 - Or query from some service which stored latest status (eg. POSTPROC)


### License

[Apache License v2.0](./LICENSE).