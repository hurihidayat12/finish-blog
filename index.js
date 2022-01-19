const express = require('express');

const app = express();
const PORT = 8080;

const db = require('./connection/db.js');  //import connection db  

app.set('view engine', 'hbs');
app.use('/public', express.static(__dirname + '/public'));
app.use(express.urlencoded({extended : false}));

let isLogin = true;


function getfullTime(time) {
    let month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktobebr", "November", "Desember"];

    let date = time.getDate();
  
    let monthIndex = time.getMonth();
    
    let year = time.getFullYear();
   
    let hours = time.getHours();
  
    let minutes = time.getMinutes();
  
    return `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`
  }


function getDistanceTime(time) {

    let timePost = time;
    let timeNow = new Date();
    
    let distance = timeNow - timePost;
  
    let miliSecond =  1000; // = 1 detik
    let secondinHours = 3600; //1jam = 3600 mili second
    let hoursinDay = 23; //23 jam dalam 1 hari
    let minutes = 60;
    let seconds = 60;
  
    let distanceDay = Math.floor(distance / (miliSecond * secondinHours * hoursinDay)); //untuk mendapakatkan hari
    let distanceHours  = Math.floor(distance / (miliSecond * seconds  * minutes )); //untuk mendapatkan jam
    let distanceMinutes = Math.floor(distance / (miliSecond * seconds))
    let distanceSecond = Math.floor(distance / miliSecond)
    
    //distanceDay = Math.floor(distanceDay);
    //console.log(distanceDay+' day ago');
  
    if (distanceDay >= 1) {
      return `${distanceDay} day ago`
    } 
      else if (distanceHours >= 1) {
        return `${distanceHours}  hours ago`
    } 
      else if (distanceMinutes >= 1){  
        return`${distanceMinutes} Minutes Ago`
    } 
      else {
        return`${distanceSecond} Second Ago`
      }
    }


// funtion memiliki2 parameter
app.get('/', function(request, response){
    response.render("index")
});

app.get('/blog', function(request, response){


    db.connect(function(err, client, done){
        if(err) throw err;

        client.query(`SELECT * FROM tb_blog`, function(err, result){
            if(err) throw err;

            // console.log(rows);
            let data = result.rows

            data = data.map(function(blog) {
                return {
                    ...blog,
                    isLogin: isLogin,
                    postAt: getfullTime(blog.postAt),
                    distance: getDistanceTime(blog.postAt),   
           }
        });




            response.render("blog", {isLogin : isLogin, blogs: data, getfullTime})

        } )

    })
});

app.get('/blog-detail/:id', function(request, response){
    // console.log(request.params);
    let id = request.params.id;
    db.connect(function(err, client, done){
        if (err) throw err;

        client.query(`SELECT * FROM tb_blog WHERE id = ${id}`, function(err, result){
            if(err) throw err;

            let data = result.rows[0];

            response.render('blog-detail', {blog: data})
        })
    })

});


app.get('/add-blog', function(request, response){
    response.render('add-blog');
});

app.post('/blog', function(request, response){
    
    let data = request.body;
    let query = `INSERT INTO tb_blog(title, content, image) VALUES ('${data.inputTitle}', '${data.inputContent}', 'image.jpg')`

    db.connect(function(err, client, done){
        if (err) throw err

        client.query(query, function(err, result){
            if(err) throw err
      
           response.redirect('/blog')
        })
    })
});

app.get('/delete-blog/:id', function(request, response){

        let id = request.params.id;
        
        let query = `DELETE FROM tb_blog WHERE id = ${id}`
        db.connect(function(err, client, done){
            if (err) throw err
    
            client.query(query, function(err, result){
                if(err) throw err
          
               response.redirect('/blog')
            })
        })
})

app.get('/contact', function(request, response){
    response.render("contact");
});

app.listen(PORT, function(){
    console.log(`server starting in port ${PORT}`);
});