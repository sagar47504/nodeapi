const express = require('express');
const app = express();
const port = 2000;
const indexRouter = require('./routes/index');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

app.listen(port, (error) =>{
  if(!error)
      console.log("Server is Successfully Running, and App is listening on port "+ port);
  else 
      console.log("Error occurred, server can't start", error);
  }
);

module.exports = app;