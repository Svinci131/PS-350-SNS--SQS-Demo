FULL NOTES:https://docs.google.com/a/bondgifts.com/document/d/1Q_NR70HKny-0VdmUscXvTJo7P_QwoSlAYGD9yMSWyhc/edit?usp=sharing

ONGOING ISSUES: SNS won’t publish to a FIFO Queue

GENERAL NOTES:

SNS:

Amazon SNS allows you to push real-time notification messages to interested subscribers over multiple delivery protocols. (It uses a “push” mechanism, eliminating the need to periodically check or “poll” for updates.)

Question: Messages are added to any queue subscribed to the topic, but you still have to call sqs.recieveMessage periodically to check get items off the queue. So, it seems like we’re still polling?

SQS:

Amazon SQS is a message queue service used by distributed applications* to exchange messages through a polling model**

It’s main advantage is that it can be used to decouple sending and receiving components—without requiring each component to be concurrently available.***

USING THEM TOGETHER:

By using Amazon SNS and Amazon SQS together, messages can be delivered to applications that require immediate notification of an event, and also persisted in an Amazon SQS queue for other applications to process at a later time.

Fanout Pattern
A message published to an SNS topic is distributed to a number of SQS queues in parallel. https://aws.amazon.com/blogs/aws/queues-and-notifications-now-best-friends/

WITH FANOUT- a message published to an SNS topic is distributed to a number of SQS queues in parallel(uploaded images could be processed as soon as a message was received so the recognition software could run simultaneously)


SUPER SIMPLE DIAGRAM:

SQS QUEUE ------> Subscribes to -------> SNS TOPIC

THEN WHEN message published to topic:

SNS -----------> sends SQS message to the subscribed queue (and all other queues)


KEY CONCEPTS: SNS

http://docs.aws.amazon.com/sns/latest/dg/AccessPolicyLanguage_KeyConcepts.html

Topic:  A topic is a communication channel to send messages and subscribe to notifications.(http://docs.aws.amazon.com/sns/latest/dg/CreateTopic.html)

EndPoints A mobile app, web server, email address, or an Amazon SQS queue that can receive notification messages from Amazon SNS.

HTTP or HTTPS:
When you subscribe an endpoint to a topic, On notification, Amazon SNS sends an HTTP POST to the subscribed endpoints with the message as json

Header and Body Parsing
http://stackoverflow.com/questions/18484775/how-do-you-access-an-amazon-sns-post-body-with-express-node-js

Request:
JSON Subject, Message, Metadata
http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html

Subscribing:
http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.subscribe
***(Must be public IP)
Amazon SNS will send a subscription confirmation- The message from Subscribe will contain a SubscribeURL- that URL will return an xml doc with the the ARN for that endpoint in the result (see step 1.1 - http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare)

WHY NOT JUST USE HTTP ENDPOINTS?
  BECAUSE...
You may not want an external service to make connections to your hosts (firewall may block all incoming connections to your host from outside).
Your end point may just die because of heavy volume of messages
Guaranteed delivery. If you configure SNS to send messages to an http end point or email or SMS, several failures to send message may result in message being dropped.
http://stackoverflow.com/questions/13681213/what-is-the-difference-between-amazon-sns-and-amazon-sqs

SQS Queue:
When you subscribe an endpoint to a topic, On notification, Amazon SNS sends an Amazon SQS message to the subscribed queue(looks similar to http)
Messages will persist in an Amazon SQS queue for other applications to process at a later time(14 days)

Permissions:
  http://docs.aws.amazon.com/sns/latest/api/API_AddPermission.html
Private IP: Status Code: 403- fix: http://stackoverflow.com/questions/15001497/sns-publishing-to-multiple-ec2-instances

Policy:
Note: Give IAM user/group permission to perform the sns:Publish action on the topic MyTopic: http://docs.aws.amazon.com/sns/latest/dg/SendMessageToSQS.html

Managing Access- Architectural Overview:
http://docs.aws.amazon.com/sns/latest/dg/AccessPolicyLanguage_ArchitecturalOverview.html

KEY CONCEPTS: SQS

SQS QUEUE TYPES:

FIFO:
The order in which messages are sent and received is strictly preserved exactly-once processing*****
No Duplicates
A message is delivered once and remains available until a consumer processes and deletes i
Up to 300 transactions per second

STANDARD:
https://aws.amazon.com/sqs/faqs/#fifo-queues
Occasionally more than one copy of a message might be delivered out of order (because of highly-distributed architecture******)
best-effort ordering*******- messages are generally delivered in the same order as they are sent.
Nearly-unlimited number of transactions per second

**IMPORTANT ISSUES: FIFO Queues can only be created where the location is Ohio, SNS doesn’t broadcast to FIFO Queues

  RELEVANT LINKS:
Diff between standard & fifo: https://aws.amazon.com/sqs/faqs/#fifo-queues
General Info: http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html
How to Create a FIFO queue:(by default sqs queue’s are standard): http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-create-queue.html

ARCHITECTURE-RECEIVING MESSAGES

REDRIVE POLICY/DEAD LETTER QUEUES

MESSAGE LOCK
When a message is received, it becomes “locked” while being processed.
https://aws.amazon.com/sqs/details/

SHARED QUEUES
http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/acp-overview.html



LINKS:

**NOTE**
You can subscribe an Amazon SQS queue to an Amazon SNS topic by using the Amazon SQS console or the API.

SNS CONSOLE:
https://console.aws.amazon.com/sns/v2/home?region=us-east-1#/home

GETTING STARTED WITH SNS:
https://aws.amazon.com/sns/getting-started/

HOW SNS AND SQS WORK TOGETHER/ARCHITECTURAL OVERVIEW
http://docs.aws.amazon.com/sns/latest/dg/SendMessageToSQS.html’

GENERAL WEBHOOK ARCHITECTURE OVERVIEW AND QUESTIONS:
http://blog.restcase.com/webhooks-role-in-the-api-world/



API NOTES:SNS

http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html

CREATE TOPIC
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#createTopic-property

Credentials:
http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html


API NOTES: SQS

STEPS:

Create Queue:
Example: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html

MESSAGE SENDING:
http://docs.aws.amazon.com/sns/latest/dg/SendMessageToSQS.html

* POTENTIAL BUG- If you delete a queue, you must wait at least 60 seconds before creating a queue with the same name



KEY CONCEPTS: AWS

EC2, Instances

Access Control Concepts: http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-creating-custom-policies.html#sqs-creating-custom-policies-key-concepts


TUTORIALS/NPM MODULES:

OFFICIAL:
https://aws.amazon.com/sdk-for-node-js/

UNOFFICIAL:
http://www.markcallen.com/node/aws-sns-and-sqs-example-using-nodejs/
https://matoski.com/article/snssqs-for-node-js/


* Distributed Applications:
Fancy word for software that is executed or run on multiple computers within a network(or stored on servers/cloud computing).

(vs: traditional applications that run on a single system, distributed applications run on multiple systems simultaneously for a single task or job)

** Polling Model:
A system where a single server visits a set of queues in some order. A group of n queues are served by a single server, typically in a cyclic order. (Look more into how the server chooses when to progress to the next node if time allows)
https://en.wikipedia.org/wiki/Polling_system

***  (Note on component availability and the polling model)

**** LOCAL HOST WILL POINT TO AMAZON’S SERVER- only public API’s can subscribe to a topic


