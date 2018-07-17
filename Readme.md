Slides are available at:

[https://andreatp.github.io/curryon2018/](https://andreatp.github.io/curryon2018/#/)

To run the example you need node and npm.

in the ```server``` directory run:

```
npm install
npm run build
npm start
```

Remember to provide a `.credentials` file in the `server` folder for twitter such as:

```
{
  "consumer_key": "XYZ",
  "consumer_secret": "XYZ",
  "token": "XYZ",
  "token_secret": "XYZ"
}
```

in the ```client``` directory run:

```
npm install
npm run build
npm run serve
```
 and then open ```http://localhost:3000/index.html``` in a recent browser.
