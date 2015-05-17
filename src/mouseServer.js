'use strict'

import sockception from 'sockception'
import maze from './maze'
import mazeSolver from './mazeSolver'

let runGame = (
    stepMax,
    stepDuration,
    rows,
    cols,
    startCallback,
    positionCallback,
    resultCallback
) => {
    let mz = maze.generate({rows, cols})
    let mouseCell = mz.getCell({row: 0, col: 0})
    let cheeseCell = mz.getCell({row: rows - 1, col: cols - 1})
    let solver = new mazeSolver(mz, mouseCell, cheeseCell)

    let stepCount = 0

    process.nextTick(() => {
        startCallback(mz.edges)
        positionCallback({pos: solver.curr.data, stepCount, stepMax})
    })

    let stepIntervalId = setInterval(() => {
        solver.step()
        stepCount++

        positionCallback({pos: solver.curr.data, stepCount, stepMax})

        if (solver.curr.id === cheeseCell.id) {
            resultCallback('success')
            clearInterval(stepIntervalId)
        } else if (stepCount === stepMax) {
            resultCallback('failure')
            clearInterval(stepIntervalId)
        }
    }, stepDuration)
}

export default function(port) {
    let api = {}

    api.listeners = {
        start: [],
        update: [],
        stop: []
    }

    api.gameRunning = false

    api.currentState = null

    api.listeners.start.push((edges) => {
        api.currentState = api.currentState || {}
        api.currentState.edges = edges
    })

    api.listeners.update.push((update) => {
        api.currentState = api.currentState || {}
        api.currentState.update = update
    })

    api.listeners.stop.push(() => {
        api.currentState = null
    })

    sockception.listen({port}).receiveMany((sock) => {
        sock.route('connected').send()

        sock.route('start').receiveMany((req) => {
            if (api.gameRunning) {
                req.route('error').send('Game already running')
                return
            }

            api.gameRunning = true

            runGame(
                150,
                500,
                11,
                15,
                (edges) => {
                    api.listeners.start.forEach(f => f(edges))
                },
                (update) => {
                    api.listeners.update.forEach(f => f(update))
                },
                (result) => {
                    api.listeners.stop.forEach(f => f(result))
                    api.gameRunning = false
                }
            )
        })

        sock.route('getStarts').receiveOne((req) => {
            let listenerIndex = api.listeners.start.length
            api.listeners.start.push((startData) => req.send(startData))
            sock.onclose(() => delete api.listeners.start[listenerIndex])
        })

        sock.route('getUpdates').receiveOne((req) => {
            let listenerIndex = api.listeners.update.length
            api.listeners.update.push((update) => req.send(update)) // TODO: just req.send?
            sock.onclose(() => delete api.listeners.update[listenerIndex])
        })

        sock.route('getStops').receiveOne((req) => {
            let listenerIndex = api.listeners.stop.length
            api.listeners.stop.push((result) => req.send(result))
            sock.onclose(() => delete api.listeners.stop[listenerIndex])
        })

        sock.route('getCurrent').receiveMany((req) => {
            req.send(api.currentState)
        })

        sock.route('ping').receiveMany((req) => req.send('pong'))
    })

    return api
}
