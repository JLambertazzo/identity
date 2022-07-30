import express, { Request, Response } from 'express'
import request from 'request'

const servers = ['http://localhost:3000', 'http://localhost:3001']
let cur = 0

const sendMessage = (message: string) => (_req: Request, res: Response) => res.send({message})

const app1 = express()
const app2 = express()

app1.get('*', sendMessage("from app1"))
app2.get('*', sendMessage("from app2"))

app1.listen(3000, () => console.log('app 1 up'))
app2.listen(3001, () => console.log('app 2 up'))

const balancer = express()

const handler = (req: Request, res: Response) => {
    req.pipe(request({url: servers[cur] + req.url})).pipe(res)
    cur = (cur + 1) % servers.length
}

balancer.get('*', handler)

balancer.listen(8080, () => console.log('balancer up'))