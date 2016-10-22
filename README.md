# facebook-bot-peter

> This is a example of building a facebook bot

> original: https://github.com/fbsamples/messenger-platform-samples/tree/master/node

# Step
### 1) set MESSAGER_APP_SECRET on setEnvVal.sh
![MESSAGER_APP_SECRET](https://storage.googleapis.com/bundle_asia_dra/temp/temp/MESSENGER_APP_SECRET.jpg)

### 2) set MESSAGER_APP_ACCESS_TOKEN on setEnvVal.sh
![MESSAGER_APP_ACCESS_TOKEN](https://storage.googleapis.com/bundle_asia_dra/temp/temp/MESSENGER_PAGE_ACCESS_TOKEN.jpg)

### 3) set MESSAGER_VALIDATION_TOKEN on setEnvVal.sh
![MESSAGER_VALIDATION_TOKEN](https://storage.googleapis.com/bundle_asia_dra/temp/temp/MESSENGER_VALIDATION_TOKEN.jpg)

### 4) Go to your heroku app page, set SEVER_URL on setEnvVal.sh
![SEVER_URL](https://storage.googleapis.com/bundle_asia_dra/temp/temp/SERVER_URL.jpg)

### 5) Go to your heroku app page, set all the four ENV values
![heroku](https://storage.googleapis.com/bundle_asia_dra/temp/temp/HEROKU_ENV.jpg)


# Run

```js
$ git clone git@github.com:wahengchang/facebook-bot-template.git
$ cd facebook-bot-template
$
$ //set up your env values in setEnvSample.sh
$ source setEnvSample.sh
$ npm start
$ // Node app is running on port 5000
$
$ // login to your heroku and set up git remote setting
$ // don't forget to set up env values on heroku
$ git add .
$ git commit -m "first commit"
$ git push heroku master
$
$
