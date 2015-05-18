'use strict'

let shuffle = require('lodash/collection/shuffle')

export default function(mz, start, end) {
    let self = this

    self.mz = mz
    self.start = start
    self.end = end

    self.curr = self.start

    self.metaData = {}

    self.getMetaData = (cell) => {
        let metaData = self.metaData[cell.id]
        if (!metaData) {
            metaData = {visits: 0}
            self.metaData[cell.id] = metaData
        }
        return metaData
    }

    self.visit = (cell) => {
        self.getMetaData(cell).visits++
    }

    self.visit(self.start)

    self.step = () => {
        let edges = []
        for (let direction in self.curr.edges) {
            let edge = self.curr.edges[direction]
            if (edge && edge.getEnabled()) {
                edges.push(edge)
            }
        }

        if (edges.length === 0) {
            return
        }

        edges = shuffle(edges)

        edges.sort((edgeA, edgeB) => {
            return self.getMetaData(edgeA.get()).visits - self.getMetaData(edgeB.get()).visits
        })

        self.curr = edges[0].get()
        self.visit(self.curr)
    }
}
