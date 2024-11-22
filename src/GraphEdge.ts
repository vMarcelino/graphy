import { GraphNode } from "./GraphNode"

export class GraphEdge {
    private _source!: GraphNode
    private _destination!: GraphNode
    private _initialized = false
    deleted = false

    constructor(source: GraphNode, destination: GraphNode, public name: string) {
        this._initialized = false
        this._source = source
        this._destination = destination
        this.source = source
        this.destination = destination
        this._initialized = true
    }

    get source() {
        return this._source
    }
    set source(value: GraphNode) {
        if (this.deleted)
            throw new Error("Tried to set the source of a deleted edge");
        if (value.deleted)
            throw new Error("Tried to set a deleted node as the source of an edge");
        if (this._initialized)
            throw new Error("Tried to set the source of an initialized edge");

        this._source = value
        value.outgoing.add(this)
    }

    get destination() {
        return this._destination
    }
    set destination(value: GraphNode) {
        if (this.deleted)
            throw new Error("Tried to set the destination of a deleted edge");
        if (value.deleted)
            throw new Error("Tried to set a deleted node as the source of an edge");
        if (this._initialized)
            throw new Error("Tried to set the destination of an initialized edge");

        this._destination = value
        value.incoming.add(this)
    }

    delete() {
        if (this.deleted)
            throw new Error("Tried to delete an already-deleted edge");

        this.source.outgoing.delete(this)
        this.destination.incoming.delete(this)
        this.deleted = true
    }

    toString() {
        return `${this.constructor.name}(name=${this.name}, source=${this.source.toString()}, destination=${this.destination.toString()})`
    }
}