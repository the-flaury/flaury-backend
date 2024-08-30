import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import { connectToDB } from './database/db.js'
import { handleErrors } from './middlewares/errorHandler.js'
import { userRoutes } from './routes/User/user-routes.js'
import { beauticianRoutes } from './routes/Beautician/beautician-routes.js'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'


const app = express()
const port = process.env.PORT

// helmet to secure app by setting http response headers
app.use(helmet());
app.use(morgan('tiny'))

let limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "We have received too many requests from this IP. Please try again after one hour."
})

// static file
app.use(express.static('public'))

// middlewares
app.use('/api', limiter)
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// cors config
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://flaury-phi.vercel.app' ],
  optionsSuccessStatus: 200,
  credentials: true,  
}

app.use(cors(corsOptions))

// routes
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/beautician', beauticianRoutes)

// home
app.get('/', (req, res) => {
  res.json({success: true, message: 'Backend Connected Successfully'})
})

// error handler
app.use(handleErrors)

// connect to database
connectToDB()


app.listen(port, ()=> {
  console.log(`Server running on port ${port}`)
})