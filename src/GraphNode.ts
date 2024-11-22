import { GraphEdge } from "./GraphEdge";
import { NotifyingSet } from "./NotifyingSet";

export class GraphNode {
    outgoing: NotifyingSet<GraphEdge> = new NotifyingSet()
    incoming: NotifyingSet<GraphEdge> = new NotifyingSet()
    deleted = false;

    private callbacks = {
        onPropertyChange: new Set<(propertyName: string | symbol) => void>()
    }

    triggerPropertyChange(propertyName: string | symbol) {
        this.callbacks.onPropertyChange.forEach(callback => callback(propertyName))
    }

    /**
     * Listen for changes to the node's properties. When a property is changed
     * (e.g. a new edge is added), the callback will be called with the name of
     * the changed property.
     *
     * @returns A function that can be called to remove the callback.
     */
    onPropertyChange(callback: (propertyName: string | symbol) => void) {
        this.callbacks.onPropertyChange.add(callback)
        return () => { this.callbacks.onPropertyChange.delete(callback) }
    }

    delete() {
        if (this.deleted)
            throw new Error("Tried to delete an already-deleted node");

        this.outgoing.forEach(edge => edge.delete())
        this.incoming.forEach(edge => edge.delete())
        this.deleted = true
    }

    toString() {
        return `${this.constructor.name}`
    }
}