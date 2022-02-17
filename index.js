const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const {nanoid} = require('nanoid');
const monk = require('monk');
require('dotenv').config();

const db = monk(process.env.MONGO_URI);
const urls = db.get('urls');
urls.createIndex({slug : 1} , {unique : true});

const port = process.env.PORT || 3000;
const app = express();
app.enable('trust proxy');

// app.use(
//     helmet({
//         contentSecurityPolicy: true,
//     })
// );
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.static('./public'));
app.use((error , req , res , next) => {
    if(error.status)
        res.status(error.status);
    else 
        res.status(501);

    res.json({
        message : error.message,
        stack : process.env.NODE_ENV === 'production'? 'production' : error.stack
    })
})


// app.get('/url/:id' , (req , res) => {
//     // #TODO : get a short url by id

// });

app.get('/i/:id' , async (req , res , next) => {
    const {id : slug} = req.params;
    try{
        const url = await urls.findOne({slug});
        console.log(url);
        if(url){
            console.log(url.url);
            res.redirect(url.url);
            return;
        } 
        res.redirect(`?error={slug} not found`);
    }catch(error){
        res.redirect(`?error=Link not found`);
    }

});

const schema = yup.object().shape({
    slug : yup.string().trim().matches(/[\w\-]/i),
    url : yup.string().trim().url().required()
});

app.post('/url' , async (req , res ,next) => {
    let {url , slug} = req.body;
    console.log(url);
    console.log(slug);
    try{
        await schema.validate({
            slug,
            url
        });

        if(!slug){
            slug = nanoid(5);
        }
        else{
            const existing = await urls.findOne({slug});
            if(existing)
                throw new Error('SLUG is USED');
        }
        slug = slug.toLowerCase();
        const secret = nanoid(10).toLowerCase();

        const new_url = {
            url,
            slug,
        };

        const created = await urls.insert(new_url);
        console.log(created);
        res.send(created);
    }catch(error){
        next(error);
    }
})



app.get('/' , (req , res) => {
    res.json({
        message : 'Short URL'
    });
});

app.listen(port , ()=>{
    console.log('Server is listening')
})


