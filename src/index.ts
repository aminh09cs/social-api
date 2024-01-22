import express from 'express'
import database from './services/database.service'
import { MainRouter } from './routes'
import { errorHandling } from './utils/error-handling'
import { createFolder } from './utils/file'

database.connectDatabase().catch(console.dir)

const app = express()
const port = 4000

console.log('process', process.argv)
createFolder()
app.use(express.json())

app.use('/web', MainRouter)

app.use(errorHandling)

app.listen(port, () => {
  console.log('Running on port', port)
})
