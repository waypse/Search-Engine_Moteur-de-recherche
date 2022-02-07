import Twig from "twig";
import express from "express";
import fetch from "node-fetch";
import bodyParser from 'body-parser';
import fs from "fs-extra";
import Cheerio from "cheerio";
import {Helper} from "./helper/helper.js"


let filePath = './index.json'
const app = express();
app.use(express.static('./assets'));
app.use(bodyParser.urlencoded({ extended: true }));


// This section is optional and used to configure twig.
app.set("twig options", {
    allow_async: true, // Allow asynchronous compiling
    strict_variables: false
});

app.get('/', async (req, res) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let parsed = JSON.parse(content);
    let display = '';
    for (let i = 0; i < parsed.length; i++) {
        display = display + '<p>'+ '<a href="'+ parsed[i].url +'">' + parsed[i].url + '</a>' + '</p>';
    }
    res.render('indexation.twig', {
        pageIndex: display,
        message: 'Indexation'
    })  

})

app.post('/', async (req, res) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let parsed = JSON.parse(content);
    let stocks = [];
    let html;
    try {
        html = await fetch(req.body.url)
    }catch (err) {
        res.redirect('/')
        return;
    }
    const boddy = await html.text();
    const $ = Cheerio.load(boddy)
    const text = $('body').text();

    let jsonTab = {
        url: req.body.url,
        data: []
    }

    for (let i = 0; i < parsed.length; i++) {
        stocks.push(parsed[i].url);
    }

    if (!stocks.includes(req.body.url)) {
        let tab = Helper.indexwords(text);
        for(let i = 0; i < tab.length; i++) {
            let word = tab[i]
            let counter= Helper.countWord(word, tab);
            let obj={
                mot: word,
                compte:counter
            }
            jsonTab.data.push(obj);
            Helper.removeoccurences(tab, word);
        }
        parsed.push(jsonTab);      
        fs.writeFileSync(filePath, JSON.stringify(parsed,null, 4));
    }   
    
    res.redirect('/')

})

app.get('/search', (req, res) => {
    

    res.render('search.twig', {
        message: "Recherche"    
    });
})

app.post('/search', (req, res) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let parsed = JSON.parse(content);

    let tab =[];    

    for(let i = 0; i < parsed.length; i++){
        for(let j = 0; j < parsed[i].data.length; j++){
            if (parsed[i].data[j].mot === req.body.url){
                let searchRes = {
                    url: parsed[i].url,
                    mot: parsed[i].data[j].mot,
                    compte: parsed[i].data[j].compte
                }
                tab.push(searchRes);
            }
        }
    }

    tab.sort(function(a, b){
        return b.compte - a.compte;
    });

    

    let display = '';
    for (let i = 0; i < tab.length; i++) {
        display = display + '<p>' +  "Le mot " + tab[i].mot + ' apparait ' + tab[i].compte + ' fois dans le site '+ '<a href="'+tab[i].url+'">' + tab[i].url + '</a>' + '</p>';
    }


    if(tab.length == 0) {
        display = display + '<p>' + 'Le mot ' + req.body.url+ " n'apparait pas dans notre base de donnees" + '</p>'
    }



    res.render('search.twig', {
        pageIndex: display,
        message: "Recherche",
    })
})

app.listen(5000, () => {
    console.log("Bizzare bizzare tes bails")
})
