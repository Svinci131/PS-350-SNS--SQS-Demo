const AWS = require('aws-sdk')
const log = require('./utils').log
const Promise = require('bluebird');
const topics = require('./secret.js')

AWS.config.update({'region': 'us-east-1'});

const sns = new AWS.SNS({apiVersion: '2010-03-31'})
const sqs = new AWS.SQS({apiVersion: '2012-11-05'})

/*-----------------------------------------------------
  
  SNS FUNCTIONALITY

-----------------------------------------------------*/

/* Example Message */

const createTopic = (sns, name) => {
  return new Promise ((res, rej) => {
    sns.createTopic({
      'Name': name
    }, (err, result) => {
      if (err !== null) rej(err)
      res(result)
    })
  })
}

const publish = (sns, message) => {
  const params = {
    Message: message,
    TopicArn: topics.myTopic
  }

  return new Promise ((res, rej) => {
    sns.publish(params, function(err, data) {
      if (err) {
        rej(err)
      }
      data.message = message
      res(data)
    })
  })
}

const publishABunchOfDummyMessages = (numOfMessages) => {
  const messages = [publish(sns, 'I am a message 1'),
                    publish(sns, 'I am a message 2'), 
                    publish(sns, 'I am a message 3'),
                    publish(sns, 'I am a message 4'),
                    publish(sns, 'I am a message 5')]

  return Promise.each(messages, (message) => {
    console.log('Published:', message.message)
  })
  .then(() => log('Posted'))
  .catch(err => console.log(err))
}

/*-----------------------------------------------------

  SQS FUNCTIONALITY

-----------------------------------------------------*/

/* ADD PERMISSIONS VIA API AND CONDITIONS IN FUTURE */
/* http://docs.aws.amazon.com/sns/latest/dg/SendMessageToSQS.html */

const standardQueueURL = 'https://sqs.us-east-1.amazonaws.com/488853390436/MyTopicSubscriber'

const deleteMessageFromQueue = (data, queueURL) => {

  const deleteParams = {
    QueueUrl: queueURL,
    ReceiptHandle: data.Messages[0].ReceiptHandle
  }

  return new Promise ((res, rej) => {
    sqs.deleteMessage(deleteParams, (err, data) => {
      if (err) {
        console.log("Delete Error", err);
        rej(err)
      } else {
        console.log("Message Deleted", data);
        res("Message Deleted")
      }
    })
  })

}

const receiveMessage = (queueURL) => {
  const params = {
    AttributeNames: [
      "SentTimestamp"
    ],
    MaxNumberOfMessages: 1,
    // ReceiveMessageWaitTimeSeconds: 3,
    QueueUrl: queueURL,
    VisibilityTimeout: 0,
    WaitTimeSeconds: 0
  }

  return new Promise((res, rej) => {
    sqs.receiveMessage(params, (err, data) => {
      if (err) rej(err)
      else {
        if (data.Messages) res(data)
        else res('No Messages were able to be retrieved')
      }
    })
  })
}

/* Recursively performs a function on each item in the queue
   and then removes it, if it keeps getting notifacations. 
   It will keep going through the queue.

   Related question: This still seems like polling?
   There must be a way to call a handler whenever a message is published
   on the topics.
*/

const processEntireQueue = (queueURL, cb, continueProcessing) => {
  if (continueProcessing) {
    return receiveMessage(queueURL)
    .then(data => {
      if (data !== 'No Messages were able to be retrieved') {
        return cb(data, queueURL).then(() => processEntireQueue(queueURL, cb, true))
      }
      else return processEntireQueue(queueURL, cb, false)
    })
  }

  console.log('Done')
}

/*-----------------------------------------------------
  
  EXAMPLE HANDLERS

-----------------------------------------------------*/

const doSomethingWithData = (data) => {
  log('Got data:'+ JSON.parse(data.Messages[0].Body).Message)
  return data
}

const doSomethingWithDataAndDelete = (data, queueURL) => {
  log('Got data:'+ JSON.parse(data.Messages[0].Body).Message)
  return deleteMessageFromQueue(data, queueURL)
}

/* -----------------------------------------------------*/

// publishABunchOfDummyMessages()
// .then(() => {
//   processEntireQueue(standardQueueURL, doSomethingWithDataAndDelete, true)
// })

publishABunchOfDummyMessages()
.then(() => receiveMessage(standardQueueURL))
.then(data => doSomethingWithData(data))

