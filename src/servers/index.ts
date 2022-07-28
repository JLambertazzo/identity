import express, { NextFunction, Request, Response } from 'express'
import request from 'request'

const PORT = parseInt(process.env.PORT || '') || 8080
const PROXY = 'http'
const HOST = 'localhost'

const identity = (req: Request, res: Response) => res.send(req.body)
const logBalanced = (serverNum: number) => (_req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${serverNum}]: handling req`)
    next()
}

export const getServerUrls = (num: number) => new Array(num).fill(`${PROXY}://${HOST}:`).map((url, index) => url + (PORT + index + 1))

export const makeServers = (num: number) => new Array(num).fill(undefined).map((_el, index) => {
    const server = express()

    server.use(express.json())
    server.use(express.text())
    server.use(express.raw())
    server.use(express.urlencoded({extended: true}))
    
    server.use(logBalanced(index + 1))

    server.get('*', identity)
    server.post('*', identity)
    server.patch('*', identity)
    server.put('*', identity)
    server.delete('*', identity)

    const curr_port = PORT + index + 1

    server.listen(curr_port, () => console.log(`[${index + 1}]: listening on ${curr_port}...`))

    return server
})