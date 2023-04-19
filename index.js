const express=require('express');
const db=require('./database')
const app=express();

app.use(express.json())
app.use(express.urlencoded({extended:false}))


//Fetch list of trades and applying pagging on trade
//For Paging we have limit the data to 10 for every page
//The result we will get is already in sorted order as trade_id is primary key and in mysql data is sorted on the basis of primary key automatically.

app.get('/listTrade',(req,res)=>{

    const{page=1}=req.query;
    let offset=(page-1)*10;
    db.execute(`SELECT * FROM TRADES as t1 INNER JOIN tradeDetails as t2 on t1.trade_id=t2.trade_id LIMIT 10 OFFSET ${offset}`,[offset]).then((response)=>{
        const data=response[0];
        res.status(200).json({data,currentPage:page})
    }).catch((err)=>{
        console.log(err);
        res.status(300).json({"error":"Please try again later"})
    })

})

//Fetch a single trade using trade_id

app.get('/singleTrade',(req,res)=>{

    const {trade_id}=req.query
    console.log(trade_id)
    db.execute('SELECT * FROM TRADES AS t1 INNER JOIN TradeDetails as t2 ON t1.trade_id=t2.trade_id WHERE t1.trade_id=?',[trade_id]).then((response)=>{
        const data=response[0];
        res.status(200).json({"data":data[0]})
    }).catch((err)=>{
        console.log(err);
        res.status(300).json({"error":"Please try again later"})
    })


})

//Fetch trade on the basis of the few parameter mentioned in assigment

app.get('/searchTrade',(req,res)=>{

    const {search}=req.query;
    db.execute('SELECT * FROM TRADES AS t1 INNER JOIN TradeDetails AS t2 WHERE t1.counterparty=? OR t1.instrument_id=? OR t1.instrument_name=? OR t1.trader=?',[search,search,search,search]).then((response)=>{
        const data=response[0];
        res.status(200).json({data});
    }).catch((err)=>{
        console.log(err)
        res.status(300).json({error:"There is error in seacrhTrade Route"})
    })

})


//Doing advance filtering on the bases of parameter provided

app.get('/advanceSearch',(req,res)=>{

    //To do optional parameter seraching what we are doing is we are creating a mysql query on the basis of parameter provided
    const{assetClass,end,maxPrice,minPrice,start,tradeType}=req.query;
    let sql='SELECT * FROM trades AS t1 INNER JOIN tradeDetails AS t2 ON t1.trade_id=t2.trade_id WHERE 1=1 ';
    if(assetClass) sql+=`AND t1.asset_class=${assetClass} `
    if(end) sql+=`AND t1.trade_date_time<=${end} `
    if(maxPrice) sql+=`AND t2.price<=${maxPrice} `
    if(minPrice) sql+=`AND t2.price>=${minPrice} `
    if(start) sql+=`AND t1.trade_date_time>=${start} `
    if(tradeType) sql+=`AND t2.buySellIndicator=${tradeType} `
    console.log(sql)

    db.execute(sql).then((response)=>{
        const data=response[0];
        res.status(200).json({"data":data})
    }).catch((err)=>{
        console.log(err)
        res.status(300).json({error:"There is problem in advance search Route"})
    })

})

const PORT=3000;
app.listen(PORT,(req,res)=>{
    console.log('The Server is up and running ',PORT)
})
