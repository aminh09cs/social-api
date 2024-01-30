import express from 'express'
import database from './services/database.service'
import { MainRouter } from './routes'
import { errorHandling } from '~/utils/error-handling'
import { createFolder } from '~/utils/file'
import databaseService from './services/database.service'
//import { DIR } from '~/utils/constant'

database.connectDatabase().then(() => {
  databaseService.createIndexUsers()
  databaseService.createIndexRefreshTokens()
  databaseService.createIndexFollowers()
})

const app = express()
const port = process.env.PORT || 4000

createFolder()
app.use(express.json())

app.use('/web', MainRouter)

//app.use('/media', express.static(DIR.UPLOAD_IMAGE_DIR))

app.use(errorHandling)

app.listen(port, () => {
  console.log('Running on port', port)
})
