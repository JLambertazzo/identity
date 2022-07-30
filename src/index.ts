import express, { Request, Response } from 'express'
import pug from 'pug'
import request from 'request'

const PORT = parseInt(process.env.PORT || '') || 8080
const NUM_SERVERS = parseInt(process.env.NUM_SERVERS || '') || 3

const app = express()
let curr = 0
const render_html = pug.compileFile('src/site/index.pug')

const balancer = (req: Request, res: Response) => {
    req.pipe(request({method: req.method, url: serverUrls[curr] + req.url})).pipe(res)
    curr = (curr + 1) % servers.length
}
const identity = (req: Request, res: Response) => res.send(req.body)

const serverUrls: string[] = []
const servers: any[] = []

for (let i = 1; i < NUM_SERVERS + 1; i++) {
    const curr_port = PORT + i
    const curr_server = express()

    curr_server.use(express.json())
    curr_server.use(express.raw())
    curr_server.use(express.text())
    curr_server.use(express.urlencoded({extended: true}))

    curr_server
        .get('*', identity)
        .post('*', identity)
        .patch('*', identity)
        .put('*', identity)
        .delete('*', identity)

    curr_server.listen(curr_port, () => console.log(`[${i}]: listening on ${curr_port}`))

    servers.push(curr_server)
    serverUrls.push(`http://localhost:${curr_port}`)
}

app.get('/', (req, res) => {
    res.send(render_html())
})

app.get('*', balancer)
app.post('*', balancer)
app.patch('*', balancer)
app.put('*', balancer)
app.delete('*', balancer)

app.listen(PORT, () => console.log(`listening on ${PORT}...`))