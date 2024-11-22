import { GraphEdge } from "./GraphEdge"
import { GraphNode } from "./GraphNode"
import { IncomingNodeList, OutgoingNodeList } from "./NodeList"

type GraphElement = GraphNode | GraphEdge
type TraversalElement<T extends GraphElement> = {
    path: {
        source: (
            { type: 'node', element: GraphNode } |
            { type: 'edge', element: GraphEdge }
        )
        traversalData: Record<string, any>
        traversalType: string
        traversalFunction: TraversalFunction<GraphElement, GraphElement>
    }[],
    element: T
}
type TraversalFunction<Source extends GraphElement, Result extends GraphElement> = (start: TraversalElement<Source>[]) => TraversalElement<Result>[]
type StripTypes<T extends TraversalFunction<any, any>> = T extends TraversalFunction<any, any> ? TraversalFunction<GraphElement, GraphElement> : never
function stripTypes<T extends TraversalFunction<any, any>>(tf: T): StripTypes<T> {
    return tf as any
}

export class Query<T extends GraphElement> {
    private readonly traversals: TraversalFunction<GraphElement, GraphElement>[] = []
    constructor(traversals?: typeof this.traversals) {
        if (traversals)
            this.traversals = traversals
    }
    private addTraversal<R extends GraphElement>(traversal: TraversalFunction<T, R>) {
        return new Query<R>([...this.traversals, stripTypes(traversal)])
    }

    throughOutgoingEdge<R extends GraphElement = T>(edgeName: string) {
        const _throughOutgoingEdge: TraversalFunction<T, R> = (start) => {
            const result: TraversalElement<R>[] = []
            start.forEach(item => {
                const element = item.element
                if (!(element instanceof GraphNode))
                    return

                element.outgoing.forEach(edge => {
                    if (edge.name !== edgeName)
                        return

                    result.push({
                        element: edge.destination as R,
                        path: [
                            ...item.path,
                            {
                                source: { type: "node", element: element },
                                traversalFunction: stripTypes(_throughOutgoingEdge),
                                traversalType: 'throughOutgoingEdge',
                                traversalData: { edgeName }
                            }
                        ]
                    })
                })
            })
            return result
        }
        return this.addTraversal<R>(_throughOutgoingEdge)
    }

    throughIncomingEdge<R extends GraphElement = T>(edgeName: string) {
        const _throughIncomingEdge: TraversalFunction<T, R> = (start) => {
            const result: TraversalElement<R>[] = []
            start.forEach(item => {
                const element = item.element
                if (!(element instanceof GraphNode))
                    return

                element.incoming.forEach(edge => {
                    if (edge.name !== edgeName)
                        return

                    result.push({
                        element: edge.destination as R,
                        path: [
                            ...item.path,
                            {
                                source: { type: "node", element: element },
                                traversalFunction: stripTypes(_throughIncomingEdge),
                                traversalType: 'throughIncomingEdge',
                                traversalData: { edgeName }
                            }
                        ]
                    })
                })
            })
            return result
        }
        return this.addTraversal<R>(_throughIncomingEdge)
    }

    throughEdge<R extends GraphNode>(edge: IncomingNodeList<any, R> | OutgoingNodeList<any, R>): Query<R> {
        if (edge.direction === "outgoing")
            return this.throughOutgoingEdge(edge.edgeName)
        return this.throughIncomingEdge(edge.edgeName)
    }

    filter(filterFunction: (item: T) => boolean) {
        const _filter: TraversalFunction<T, T> = start => {
            const result: TraversalElement<T>[] = []
            start.forEach(item => {
                const filterResult = filterFunction(item.element)
                if (!filterResult)
                    return

                let source: TraversalElement<T>['path'][number]['source']
                if (item.element instanceof GraphNode)
                    source = { type: 'node', element: item.element }
                else
                    source = { type: 'edge', element: item.element }

                result.push({
                    element: item.element,
                    path: [
                        ...item.path,
                        {
                            source,
                            traversalType: 'filter',
                            traversalData: { filterFunction },
                            traversalFunction: stripTypes(_filter)
                        }
                    ]
                })
            })
            return result
        }
        return this.addTraversal<T>(_filter)
    }


    execute(start: GraphElement | GraphElement[], returnFullResult?: false): T[]
    execute(start: GraphElement | GraphElement[], returnFullResult: boolean): TraversalElement<T>[]
    execute(start: GraphElement | GraphElement[], returnFullResult: boolean = false) {
        if (!Array.isArray(start)) {
            start = [start]
        }
        let result: TraversalElement<GraphElement>[] = start.map(item => ({
            element: item,
            path: []
        }))
        this.traversals.forEach(traversalFunction => {
            result = traversalFunction(result)
        })
        if (!returnFullResult)
            return result.map(item => item.element)
        return result
    }
}

export const query = new Query([])