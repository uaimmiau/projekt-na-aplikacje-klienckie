let express = require("express");
let app = express();
let path = require("path");
let PORT = process.env.PORT || 3000;
let bodyParser = require("body-parser")
let tab = [{
    id: 1,
    log: "AAA",
    pass: "PASS1",
    wiek: 10,
    uczen: "checked",
    plec: "m"
}, {
    id: 2,
    log: "test",
    pass: "test",
    wiek: 12,
    uczen: "checked",
    plec: "k"
}, {
    id: 3,
    log: "test2",
    pass: "test",
    wiek: 11,
    uczen: "checked",
    plec: "k"
}, {
    id: 4,
    log: "test3",
    pass: "test",
    wiek: 20,
    uczen: "",
    plec: "m"
}, ]
let loggedIn = false;

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + '/static/main.html'))
})
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname + '/static/register.html'))
})
app.post("/register", (req, res) => {
    let valid = true;
    for (user of tab) {
        if (req.body.login == user.log)
            valid = false
    }
    if (valid) {
        tab.push({
            id: tab.length + 1,
            log: req.body.login,
            pass: req.body.password,
            wiek: req.body.wiek,
            uczen: req.body.uczen,
            plec: req.body.plec
        })
        res.send(`Witaj ${req.body.login}, zostałeś zarejestrowany`)
        console.log(tab)
    } else {
        res.send('Istnieje już użytkownik o takim loginie')
    }
})
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname + '/static/login.html'))
})
app.get("/admin", (req, res) => {
    if (loggedIn) {
        res.sendFile(path.join(__dirname + '/static/admin.html'))
    } else {
        res.sendFile(path.join(__dirname + '/static/403.html'))
    }
})
app.post("/admin", (req, res) => {
    for (user of tab) {
        if (user.log == req.body.login && user.pass == req.body.password) {
            loggedIn = true;
            res.sendFile(path.join(__dirname + '/static/admin.html'))
        }
    }
    if (!loggedIn) {
        res.send('Zły login lub hasło!')
    }
})
app.get("/logout", (req, res) => {
    loggedIn = false
    res.redirect("/")
})
let nav = '<nav><ul id = "navList"><li><a href = "/sort">sort</a></li><li><a href="/gender">gender</a></li><li><a href="/show">show</a></li></ul></nav>';
let styles = 'body {margin: 0;padding: 0;background-color: rgb(35, 47, 70);box-sizing: border-box;}nav {background-color: rgb(60, 44, 117);}#navList {display: flex;list-style-type: none;margin: 0;}#navList>li {padding: 20px;}#navList>li>a {font-size: 30px;color: #ffffff;}td{border: 1px solid yellow;padding: 10px;color: white;font-size: 20px}table{width: 100%;padding: 20px}';
app.get("/show", (req, res) => {
    if (!loggedIn) {
        res.sendFile(path.join(__dirname + '/static/403.html'))
        return
    }
    let table = '<table>';
    for (user of tab) {
        let row = '<tr>';
        for (property in user) {
            if (property == 'uczen') {
                row += `<td>${property}: <input type="checkbox" ${user[property]} disabled></td>`;
            } else if (property == 'log') {
                row += `<td>${property}: ${user[property]}`;
            } else if (property == 'pass') {
                row += ` - ${user[property]}</td>`;
            } else {
                row += `<td>${property}: ${user[property]}</td>`;
            }
        }
        row += '</tr>';
        table += row;
    }
    table += '</table>';
    let html = `<html><head><style>${styles}</style></head><body>${nav}${table}</body></html>`;
    res.send(html);
})
app.get("/gender", (req, res) => {
    if (!loggedIn) {
        res.sendFile(path.join(__dirname + '/static/403.html'))
        return
    }
    let tableF = '<table>',
        tableM = '<table>';
    for (user of tab) {
        let row = '<tr>';
        row += `<td>id: ${user.id}</td><td>płeć: ${user.plec}</td>`;
        row += '</tr>';
        if (user.plec == 'k') {
            tableF += row;
        } else {
            tableM += row;
        }
    }
    tableF += '</table>';
    tableM += '</table>';
    let html = `<html><head><style>${styles}</style></head><body>${nav}${tableF}${tableM}</body></html>`;
    res.send(html);
})
app.get("/sort", (req, res) => {
    if (!loggedIn) {
        res.sendFile(path.join(__dirname + '/static/403.html'))
        return
    }
    let form = `<form onchange="this.submit()" method="POST" action="/sort"><div style="display: flex; align-items: baseline; color: white; padding: 20px; font-size: 20px"><input type="radio" checked value="rosnaco" name="option"><p>rosnąco</p><input type="radio" value="malejaco" name="option"><p>malejąco</p></div></form>`
    let table = '<table>';
    let sorted = tab;
    sorted.sort((a, b) => {
        return parseFloat(a.wiek) - parseFloat(b.wiek);
    })
    for (user of tab) {
        let row = '<tr>';
        row += `<td>id: ${user.id}</td><td>user: ${user.log} - ${user.pass}</td><td>wiek: ${user.wiek}</td>`;
        row += '</tr>';
        table += row;
    }
    let html = `<html><head><style>${styles}</style></head><body>${nav}${form}${table}</body></html>`;
    res.send(html);
})
app.post("/sort", (req, res) => {
    let rosnaco = '',
        malejaco = '';
    let sorted = tab;
    if (req.body.option == "rosnaco") {
        sorted.sort((a, b) => {
            return parseFloat(a.wiek) - parseFloat(b.wiek);
        })
        rosnaco = 'checked';
        malejaco = '';
    } else {
        sorted.sort((a, b) => {
            return parseFloat(b.wiek) - parseFloat(a.wiek);
        })
        rosnaco = '';
        malejaco = 'checked';
    }
    let form = `<form onchange="this.submit()" method="POST" action="/sort"><div style="display: flex; align-items: baseline; color: white; padding: 20px; font-size: 20px"><input type="radio" ${rosnaco} value="rosnaco" name="option"><p>rosnąco</p><input type="radio" ${malejaco} value="malejaco" name="option"><p>malejąco</p></div></form>`
    let table = '<table>';
    for (user of tab) {
        let row = '<tr>';
        row += `<td>id: ${user.id}</td><td>user: ${user.log} - ${user.pass}</td><td>wiek: ${user.wiek}</td>`;
        row += '</tr>';
        table += row;
    }
    let html = `<html><head><style>${styles}</style></head><body>${nav}${form}${table}</body></html>`;
    res.send(html);
})

app.use(express.static("static"));

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT);
});