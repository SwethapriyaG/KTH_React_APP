
const express = require("express");

const app = express();

const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Kaashvi@2013",
    database: "test_Kth",
    port: "3306",
})  

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/api/get", (req, res) => {
  const sqlquery = "select distinct c.Kod, c.Benämning, c.Kur, dt.period, dt.points, s.students, e.fname, e.lname,  a.time, e.ssnb from course c join duration_table dt on dt.Kod = c.Kod join program p on c.Kod = p.Kod join class s on s.class = p.class join assignments a on a.Kod = c.Kod join employee e on a.ssnb = e.ssnb order by c.Kod, dt.period";
  
     db.query(sqlquery,(error, result) => {
      
      
        const groupedData = {};

        result.forEach(item => {
  const key = `${item.Kod}-${item.Benämning}`;
  if (!groupedData[key]) {
    groupedData[key] = {
      code: item.Kod,
      
      periods: [
        {
          period: item.period,
          points: [item.points],
          
        },
      ],
      professor: [
        {
          fname: item.fname,
          lname: item.lname,
          time: item.time,
          ssnb: item.ssnb,   
          fullname: `${item.fname.slice(0, 2)}${item.lname.slice(0, 2)}`,
        },
      ],
      name: item.Benämning,
      factor: item.Kur,
      students: item.students,
      
    };
  } else {
    const existingPeriod = groupedData[key].periods.find(period => period.period === item.period);
    if (existingPeriod) {
      if (!existingPeriod.points.includes(item.points)) {
      existingPeriod.points.push(item.points);
      }
      
    } else {
      groupedData[key].periods.push({
        period: item.period,
        points: [item.points],
      });
    };
    const existingProf = groupedData[key].professor.find(prof => prof.ssnb === item.ssnb);
    if (existingProf) {
      existingProf.time+=item.time;
      
    } else {
      groupedData[key].professor.push({
        fname: item.fname,
          lname: item.lname,
          time: item.time,
          ssnb: item.ssnb, 
          fullname: `${item.fname.slice(0, 2)}${item.lname.slice(0, 2)}`,
      });
    };
    
  };
  
});

Object.values(groupedData).forEach((group) => {
  group.professor.forEach((prof) => {
    const uniquePeriods = new Set(group.periods.map((period) => period.period));
    prof.time /= uniquePeriods.size;
  
  });
});

const outputData = Object.values(groupedData);

console.log(JSON.stringify(outputData, null, 2));
res.send(outputData);

    });
 });



app.get("/", (req, res) => {

});
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});