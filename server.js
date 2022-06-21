const express = require('express');
const mustacheExpress = require('mustache-express');
const app = express();
const mustache = mustacheExpress();
const bodyParser = require("body-parser");
const { Client } = require('pg');

mustache.cache = null;
app.engine("mustache", mustache);
app.set("view engine", "mustache");


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })
//express-session
const session = require('express-session');

//middleware
const isLoggedIn = require('./middleware');

const sessionConfig = {
    name: 'session',
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
///////////////////////////login/////////////////////////////////////////////////
app.get('/signin', (req, res) => {
    res.render('signin');
});

app.post('/signin', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    console.log(req.body.email, req.body.password, req.body);
    client.connect()
        .then(() => {
            console.log("connection complete");
            const sql = 'SELECT * FROM users WHERE email = $1 AND password = $2';
            const params = [req.body.email, req.body.password];
            return client.query(sql, params);
        })
        .then((result) => {
          console.log(result);
             if (result.rows.length > 0) {
              console.log(result.rows[0]);
                req.session.loggedin = true;
                req.session.username = result.rows[0].username;

                console.log(req.session.username, "has logged in successfully");
                res.redirect(req.session.returnTo || '/editorview');
            } else {

                res.send('Incorrect Username and/or Password!');
            }
            res.end();
        });
})

///////////////////////////register/////////////////////////////////////////////////
app.get('/register', (req, res) => {
    res.render('register');
})
app.post('/register', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
console.log('hi hello');
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    client.connect()
        .then(() => {
            console.log("connection complete");
            // INSERT INTO doctor (id, name ,dept, experience, degree, available_time, to_till) VALUES ($1, $2, $3, $4, $5, $6, $7)
            let sql = 'INSERT INTO users(username,email, password) VALUES ($1, $2, $3)';
            const params = [req.body.username, req.body.email, req.body.password];
            return client.query(sql,params);
        })
        .then((result) => {
            console.log('results?', result);
            res.redirect('/signin');
        });
})
//---------------------LOGOUT---------------------
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});
/////////////////////////////////////////////////////////////////////////////////////

app.get('/doctordetails', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            return client.query('SELECT * FROM doctor')
        })
        .then((result) => {
            console.log('results?', result);
            res.render('doctordetails-view', result);
        });
});


app.get('/patientdetails', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            return client.query('SELECT * FROM patient')
        })
        .then((result) => {
            console.log('results?', result);
            res.render('patientdetails-view', result);
        });
});


app.get('/medicinedetails', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            return client.query('SELECT * FROM meds')
        })
        .then((result) => {
            console.log('results?', result);
            res.render('medecinedetails-view', result);
        });
});





////////////////////////////////////////////////////////////////////////////////////////

app.get('/editorview' , isLoggedIn.isLoggedIn, (req, res) => {
    res.render('editor-view');
});



app.get('/normalview' , (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            return client.query('SELECT SUM(count) FROM meds; SELECT DISTINCT COUNT(brand) FROM meds');
        })
        .then((results) => {
            console.log('?results', results[0]);
            console.log('?results', results[1]);
            res.render('normal-view', { n1: results[0].rows, n2: results[1].rows });
        });
});


///////////////////////////////////////////////////////////////////////////////////////
app.get('/doctorslots', (req, res) => {
    res.render('docpat');
});

app.get('/doctordetailss', (req, res) => {

    res.render('doctordetailss',);
});


app.get('/doctorslot/add', (req, res) => {
    console.log("post body", req.body, req.query, req.params);


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            const sql = 'select e.id, f.dept, f.name, f.available_time, f.to_till, f.experience from doctor as f, patient as e where e.id =$1 and f.dept=e.diagnosed_type;'
            const params = [req.query.id];
            return client.query(sql, params);
        })
        .then((result) => {
            console.log('results?', result);
            res.render('doctordetailss', { rows: result.rows });
        });


});














/////////////////////////////////////////////////////////////////////////////////////




app.get('/doctor', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            return client.query('SELECT * FROM doctor')
        })
        .then((result) => {
            console.log('results?', result);
            res.render('doctor', result);
        });
});


app.get('/doctoradd', (req, res) => {
    res.render('doctor-form');
});

app.post('/doctor/add', (req, res) => {
    console.log("post body", req.body);


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            const sql = 'INSERT INTO doctor (id, name ,dept, experience, degree, available_time, to_till) VALUES ($1, $2, $3, $4, $5, $6, $7)'
            const params = [req.body.id, req.body.name, req.body.dept, req.body.experience, req.body.degree, req.body.available_time, req.body.to_till];
            return client.query(sql, params);
        })
        .then((result) => {
            console.log('results?', result);
            res.redirect('/doctor');
        });


});



app.post('/doctor/delete/:id', (req, res) => {


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'DELETE FROM doctor WHERE id = $1'
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((result) => {
            res.redirect('/doctor');
        });

});



app.get('/doctor/edit/:id', (req, res) => {

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'SELECT * FROM doctor WHERE id=$1'
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((results) => {
            res.render('doctor-edit', { doctor: results.rows[0] });
        });


});



app.post('/doctor/edit/:id', (req, res) => {


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'UPDATE doctor SET id=$1, name=$2, dept=$3, experience=$4, degree=$5, available_time=$6, to_till=$7 WHERE id=$8'
            const params = [req.body.id, req.body.name, req.body.dept, req.body.experience, req.body.degree, req.body.available_time, req.body.to_till, req.params.id];

            return client.query(sql, params);
        })
        .then((result) => {
            res.redirect('/doctor');
        });

});












//////////////////////////////////////////////////////////////////////////////////////



app.get('/dealer', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            return client.query('SELECT * FROM dealer')
        })
        .then((result) => {
            console.log('results?', result);
            res.render('dealer', result);
        });
});


app.get('/dealeradd', (req, res) => {
    res.render('dealer-form');
});

app.post('/dealer/add', (req, res) => {
    console.log("post body", req.body);


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            const sql = 'INSERT INTO dealer (id, name ,company, supply, bill) VALUES ($1, $2, $3, $4, $5)'
            const params = [req.body.id, req.body.name, req.body.company, req.body.supply, req.body.bill];
            return client.query(sql, params);
        })
        .then((result) => {
            console.log('results?', result);
            res.redirect('/dealer');
        });


});



app.post('/dealer/delete/:id', (req, res) => {


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'DELETE FROM dealer WHERE id = $1'
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((result) => {
            res.redirect('/dealer');
        });

});



app.get('/dealer/edit/:id', (req, res) => {

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'SELECT * FROM dealer WHERE id=$1'
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((results) => {
            res.render('dealer-edit', { dealer: results.rows[0] });
        });


});



app.post('/dealer/edit/:id', (req, res) => {


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'UPDATE dealer SET id=$1, name=$2, company=$3, supply=$4, bill=$5 WHERE id=$6'
            const params = [req.body.id, req.body.name, req.body.company, req.body.supply, req.body.bill, req.params.id];

            return client.query(sql, params);
        })
        .then((result) => {
            res.redirect('/dealer');
        });

});




// app.get('/signin', (req, res) => {
// res.render('signin');
// });


// app.post('/signin', (req, res) => {

// });




//////////////////////////////////////////////////////////////////////////////////


app.get('/workers', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            return client.query('SELECT * FROM worker_details')
        })
        .then((result) => {
            console.log('results?', result);
            res.render('workers', result);
        });
});


app.get('/workersadd', (req, res) => {
    res.render('workers-form');
});

app.post('/workers/add', (req, res) => {
    console.log("post body", req.body);


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            const sql = 'INSERT INTO worker_details (id, name , type_of_work, join_date) VALUES ($1, $2, $3, $4)'
            const params = [req.body.id, req.body.name, req.body.type_of_work, req.body.join_date];
            return client.query(sql, params);
        })
        .then((result) => {
            console.log('results?', result);
            res.redirect('/workers');
        });


});



app.post('/workers/delete/:id', (req, res) => {


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'DELETE FROM worker_details WHERE id = $1'
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((result) => {
            res.redirect('/workers');
        });

});



app.get('/workers/edit/:id', (req, res) => {

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'SELECT * FROM worker_details WHERE id=$1'
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((results) => {
            res.render('workers-edit', { workers: results.rows[0] });
        });


});



app.post('/workers/edit/:id', (req, res) => {


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'UPDATE worker_details SET id=$1, name=$2, type_of_work=$3, join_date=$4 WHERE id=$5'
            const params = [req.body.id, req.body.name, req.body.type_of_work, req.body.join_date, req.params.id];

            return client.query(sql, params);
        })
        .then((result) => {
            res.redirect('/workers');
        });

});












/////////////////////////////////////////////////////////////


app.get('/ambulance', (req, res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            return client.query('SELECT * FROM ambulance')
        })
        .then((result) => {
            console.log('results?', result);
            res.render('ambulance', result);
        });
});


app.get('/ambulanceadd', (req, res) => {
    res.render('ambulance-form');
});

app.post('/ambulance/add', (req, res) => {
    console.log("post body", req.body);


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            const sql = 'INSERT INTO ambulance (vechile_number, name , total_trips) VALUES ($1, $2, $3)'
            const params = [req.body.vechile_number, req.body.name, req.body.total_trips];
            return client.query(sql, params);
        })
        .then((result) => {
            console.log('results?', result);
            res.redirect('/ambulance');
        });


});



app.post('/ambulance/delete/:vechile_number', (req, res) => {


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'DELETE FROM ambulance WHERE vechile_number = $1'
            const params = [req.params.vechile_number];
            return client.query(sql, params);
        })
        .then((result) => {
            res.redirect('/ambulance');
        });

});



app.get('/ambulance/edit/:vechile_number', (req, res) => {

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'SELECT * FROM ambulance WHERE vechile_number=$1'
            const params = [req.params.vechile_number];
            return client.query(sql, params);
        })
        .then((results) => {
            res.render('ambulance-edit', { ambulance: results.rows[0] });
        });


});



app.post('/ambulance/edit/:vechile_number', (req, res) => {


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'UPDATE ambulance SET vechile_number=$1, name=$2, total_trips=$3 WHERE vechile_number=$4'
            const params = [req.body.vechile_number, req.body.name, req.body.total_trips, req.params.vechile_number];

            return client.query(sql, params);
        })
        .then((result) => {
            res.redirect('/ambulance');
        });

});





///////////////////////////////////////////////////////////////

app.get('/patient', (req, res) => {

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            return client.query('SELECT * FROM patient')
        })
        .then((result) => {
            console.log('results?', result);
            res.render('patient', result);
        });



})

app.get('/patientadd', (req, res) => {
    res.render('patient-form');
});


app.post('/patient/add', (req, res) => {
    console.log("post body", req.body);


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            const sql = 'INSERT INTO patient (id, name , diagnosed_type, admitted_date) VALUES ($1, $2, $3, $4)'
            const params = [req.body.admittedNumber, req.body.medicineName, req.body.diagnosedType, req.body.admittedDate];
            return client.query(sql, params);
        })
        .then((result) => {
            console.log('results?', result);
            res.redirect('/patient');
        });


});



app.post('/patient/delete/:id', (req, res) => {


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'DELETE FROM patient WHERE id = $1'
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((result) => {
            res.redirect('/patient');
        });

});



app.get('/patient/edit/:id', (req, res) => {

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'SELECT * FROM patient WHERE id=$1'
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((results) => {
            res.render('patient-edit', { patient: results.rows[0] });
        });


})



app.post('/patient/edit/:id', (req, res) => {


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'UPDATE patient SET name=$1, diagnosed_type=$2, admitted_date=$3 WHERE id=$4'
            const params = [req.body.medicineName, req.body.diagnosedType, req.body.admittedDate, req.params.id];

            return client.query(sql, params);
        })
        .then((result) => {
            res.redirect('/patient');
        });

});







///////////////////////////////////////////////////////////////////////////






app.get('/add', (req, res) => {
    res.render('med-form');
})




app.post('/meds/add', (req, res) => {
    console.log("post body", req.body);

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            console.log("connection complete");
            const sql = 'INSERT INTO meds (name, count, brand) VALUES ($1, $2, $3)'
            const params = [req.body.name, req.body.count, req.body.brand];
            return client.query(sql, params);
        })
        .then((result) => {
            console.log('results?', result);
            res.redirect('/meds');
        });

});




app.get('/meds', (req, res) => {

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            return client.query('SELECT * FROM meds');
        })
        .then((results) => {
            res.render('meds', results);
        });


})



app.post('/meds/delete/:id', (req, res) => {


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'DELETE FROM meds WHERE mid = $1'
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((result) => {
            res.redirect('/meds');
        });

});



app.get('/meds/edit/:id', (req, res) => {

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'SELECT * FROM meds WHERE mid=$1'
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((results) => {
            res.render('meds-edit', { med: results.rows[0] });
        });


})



app.post('/meds/edit/:id', (req, res) => {


    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical1',
        password: 'karthik@123',
        port: 5432
    })
    client.connect()
        .then(() => {
            const sql = 'UPDATE meds SET name=$1, count=$2, brand=$3 WHERE mid=$4'
            const params = [req.body.name, req.body.count, req.body.brand, req.params.id];

            return client.query(sql, params);
        })
        .then((result) => {
            res.redirect('/meds');
        });

});


app.listen(5001, () => {
    console.log("port running succesfully at 5001");
})
