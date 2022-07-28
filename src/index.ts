import express, { Request, Response } from 'express'
import pug from 'pug'
import request from 'request'
import { getServerUrls, makeServers } from './servers'

const PORT = parseInt(process.env.PORT || '') || 8080
const NUM_SERVERS = parseInt(process.env.NUM_SERVERS || '') || 3

const app = express()
makeServers(NUM_SERVERS)
const servers = getServerUrls(NUM_SERVERS)
let curr = 0
const render_html = pug.compileFile('src/site/index.pug')

const balancer = (req: Request, res: Response) => {
    req.pipe(request({url: servers[curr] + req.url})).pipe(res)
    curr = (curr + 1) % servers.length
}

app.use(express.json())
app.use(express.text())
app.use(express.raw())
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) => {
    res.send(render_html())
})

app.get('*', balancer)
app.post('*', balancer)
app.patch('*', balancer)
app.put('*', balancer)
app.delete('*', balancer)

app.listen(PORT, () => console.log(`listening on ${PORT}...`))