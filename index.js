const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const port = process.env.PORT || 3000;
const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.static('./public'));


// app.get('/url/:id' , (req , res) => {
//     // #TODO : get a short url by id

// });

// app.get('/:id' , (req , res) => {
//     // #TODO : redirect to url

// })

// app.get('/url' , (req , res) => {
//     // #TODO : create a short URL
// })

app.get('/' , (req , res) => {
    res.json({
        message : 'Short URL'
    });
});

app.listen(port , ()=>{
    console.log('Server is listening')
})


