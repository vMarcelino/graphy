import { GraphNode } from "./GraphNode";
import { GraphEdge } from "./GraphEdge";
import { query } from "./Query";

class NodeList<Parent extends GraphNode, Item extends GraphNode> {
    constructor(
        public parent: Parent,
        public edgeName: string,
        public itemType: new (...args: any) => Item,
        public propertyName?: string,
        public direction: "outgoing" | "incoming" = "outgoing"
    ) {
        const set = direction == "outgoing" ? parent.outgoing : parent.incoming
        set.on('beforeAdd', edge => {
            if (edge.name != edgeName) return
            const newItem = direction == "outgoing" ? edge.destination : edge.source
            const isSubclass = newItem instanceof itemType
            const allowed = isSubclass
            if (!allowed) {
                return `Failed to add node to list: ${newItem} is not a subclass of ${this.itemType}`
            }
        })


        const getPropertyName = () => {
            if (this.propertyName === undefined) {
                // Find property name
                for (const prop in parent) {
                    if (parent[prop] === this) {
                        this.propertyName = prop
                        break
                    }
                }
            }

            if (this.propertyName === undefined) {
                throw new Error(`Failed to find property name for ${this.itemType}`)
            }
            return this.propertyName
        }

        set.on('afterAddValidated', edge => {
            if (edge.name != edgeName) return
            parent.triggerPropertyChange(getPropertyName())
        })

        set.on('afterDeleteValidated', edge => {
            if (edge.name != edgeName) return
            parent.triggerPropertyChange(getPropertyName())
        })
    }

    push(item: Item) {
        if (this.direction == "outgoing") {
            new GraphEdge(this.parent, item, this.edgeName)
        }
        else {
            new GraphEdge(item, this.parent, this.edgeName)
        }
    }

    asList() {
        let _query
        if (this.direction == "outgoing") {
            _query = query.throughOutgoingEdge<Item>(this.edgeName)
        }
        else {
            _query = query.throughIncomingEdge<Item>(this.edgeName)
        }
        const results = _query.execute(this.parent)
        return results
    }
}

export class OutgoingNodeList<Parent extends GraphNode, Item extends GraphNode> extends NodeList<Parent, Item> {
    declare direction: "outgoing"
    constructor(parent: Parent, edgeName: string, itemType: new (...args: any) => Item, propertyName?: string) {
        super(parent, edgeName, itemType, propertyName, "outgoing")
    }
}

export class IncomingNodeList<Parent extends GraphNode, Item extends GraphNode> extends NodeList<Parent, Item> {
    declare direction: "incoming"
    constructor(parent: Parent, edgeName: string, itemType: new (...args: any) => Item, propertyName?: string) {
        super(parent, edgeName, itemType, propertyName, "incoming")
    }
}