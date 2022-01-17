const express =require('express')
const jwt = require('jsonwebtoken')
const customFs = require('./lib/fsdeal')

const app = express()
const SECRET_KEY = 'SECRET_KEY'

const users = new customFs('./model/users.json')
const students = new customFs('./model/students.json')
const teachers = new customFs('./model/teachers.json')
const groups = new customFs('./model/groups.json')


app.use(express.json());

const verifyToken = (req, res, next) => {
  
  try {
    const {token} = req.headers;
  const { user } = jwt.verify(token, SECRET_KEY);

    const foundUsers = JSON.parse(users.read())
    const foundGroups = foundUsers.concat(JSON.parse(groups.read()))
    const foundStudents = foundGroups.concat(JSON.parse(students.read()))
    const allUsers = foundStudents.concat(JSON.parse(teachers.read()))
    allUsers.map((e,i) => {
      e.id = i;
    })
    const user1 = allUsers.find(e => e.name==user)
    console.log(allUsers);
    console.log(user1);
    if(!user1){
      res.status(401).send({
        status: 401,
        messege: 'User not found'
      })
    }
    else {
      next()
  }
  } catch(e) {
    res.status(401).send({
      status: 401,
      messege: 'invalid token'
    })
  }
}

app.post('/login', (req, res) => {
  const {username, password} = req.body;
  const foundUsers = JSON.parse(users.read());
  const foundGroups = foundUsers.concat(JSON.parse(groups.read()))
  const foundStudents = foundGroups.concat(JSON.parse(students.read()))
  const allUsers = foundStudents.concat(JSON.parse(teachers.read()))
  allUsers.map((e,i) => {
    e.id = i;
  })
  // console.log(allUsers);
  const user = allUsers.find(e => e.name == username && e.password == password)

  const accessToken = jwt.sign({user:user.name}, SECRET_KEY);
  // console.log(accessToken);
  if(!user){
    res.sendStatus(401)
  }
  else {
     res.json(accessToken)
}
})

app.get('/posts/:postId',verifyToken, (req,res) => {
 
  const foundUsers = JSON.parse(users.read());
  const foundGroups = foundUsers.concat(JSON.parse(groups.read()))
  const foundStudents = foundGroups.concat(JSON.parse(students.read()))
  const allUsers = foundStudents.concat(JSON.parse(teachers.read()))
  allUsers.map((e,i) => {
    e.id = i;
  })
  res.end(JSON.stringify(allUsers, null, 4));
})

app.get('/groups',verifyToken, (req,res) => {
  const allUsers = groups.read()
  res.end(allUsers);
})

app.get('/students/:postId',verifyToken, (req,res) => {
  const allUsers = students.read()
  res.end(allUsers);
})

app.get('/teachers',verifyToken, (req,res) => {
  const allUsers = teachers.read()
  res.end(allUsers);
})

app.listen(9000, console.log('server is running at 9000 port'))