const AWS = require('aws-sdk')
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
      res(data)
    })
  })
}

/*-----------------------------------------------------

  SQS FUNCTIONALITY

-----------------------------------------------------*/

/* ADD PERMISSIONS VIA API AND CONDITIONS IN FUTURE */
/* http://docs.aws.amazon.com/sns/latest/dg/SendMessageToSQS.html */

const queueURL = 'https://sqs.us-east-1.amazonaws.com/488853390436/MyTopicSubscriber'

/* Example Queue Params */

const MyTopicSubscriberQueueParams = {
  AttributeNames: [
    "SentTimestamp"
  ],
  MaxNumberOfMessages: 1,
  // ReceiveMessageWaitTimeSeconds: 3,
  QueueUrl: queueURL,
  VisibilityTimeout: 0,
  WaitTimeSeconds: 0
}

const deleteMessageFromQueue = (data) => {

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

const receiveMessage = (params) => {
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
   It will keep going through the queue. */ 
const processEntireQueue = (params, cb, continueProcessing) => {
  if (continueProcessing) {
    return receiveMessage(params)
    .then(data => {
      if (data !== 'No Messages were able to be retrieved') {
        return cb(data).then(() => processEntireQueue(params, cb, true))
      }
      else return processEntireQueue(params, cb, false)
    })
  }

  console.log('Done')
}

/*-----------------------------------------------------
  
  EXAMPLE HANDLERS

-----------------------------------------------------*/

const doSomethingWithData = (data) => {
  console.log('Got data:', JSON.parse(data.Messages[0].Body).Message)
  return data
}

const doSomethingWithDataAndDelete = (data) => {
  console.log('Got data:', JSON.parse(data.Messages[0].Body).Message)
  return deleteMessageFromQueue(data)
}

/* _______________________________________
  
  SYNC EXAMPLE
  _______________________________________ */

publish(sns, 'I am a message')
.then(data => console.log(data, 'publish'))
.then(() => receiveMessage(MyTopicSubscriberQueueParams))
.then(data => {
  if (data && data !== 'No Messages were able to be retrieved') {
    return doSomethingWithData(data)
  }
})
// .then(data => deleteMessageFromQueue(data))
.catch(err => console.log(err, err.stack))

/* _______________________________________
  
  ASYNC EXAMPLE
  _______________________________________ */

/* processEntireQueue(MyTopicSubscriberQueueParams, doSomethingWithDataAndDelete, true) */


