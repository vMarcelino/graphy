import { GraphNode } from ".";
import { GraphEdge } from "./GraphEdge";
import { query } from "./Query";

// export function edge<Item extends GraphNode, This, T>(edgeName: string, itemType: new (...args: any) => Item, direction: "outgoing" | "incoming" = "outgoing"): ClassAccessorDecorator<This, T> {
//     return (target, context) => {
//         return {
//             get() {
//                 return target.get.call(this)
//             },
//             set(value) {

//             },
//             init(value) {
//                 return value
//             },
//         }
//     }
// }
export function outgoingEdge<Item extends GraphNode, This extends GraphNode>(edgeName: string, itemType: new (...args: any) => Item, required: true): ClassAccessorDecorator<This, Item>
export function outgoingEdge<Item extends GraphNode, This extends GraphNode>(edgeName: string, itemType: new (...args: any) => Item, required: false): ClassAccessorDecorator<This, Item | undefined>
export function outgoingEdge<Item extends GraphNode, This extends GraphNode>(edgeName: string, itemType: new (...args: any) => Item, required: boolean): ClassAccessorDecorator<This, Item | undefined>
export function outgoingEdge<Item extends GraphNode, This extends GraphNode>(edgeName: string, itemType: new (...args: any) => Item, required: boolean): ClassAccessorDecorator<This, Item | undefined> {
    return (target, context) => {

        // console.log({ context })
        // let updating = false

        return {
            get() {
                const results = query.throughOutgoingEdge<Item>(edgeName).filter(i => i instanceof itemType).execute(this)
                if (results.length === 0) {
                    if (required)
                        throw new Error("No outgoing edge found");
                    return undefined
                }
                else if (results.length > 1) {
                    throw new Error("Multiple outgoing edges found");
                }
                return results[0]
            },
            set(value) {
                let edge
                for (const _edge of this.outgoing) {
                    if (_edge.name === edgeName) {
                        edge = _edge
                        break
                    }
                }

                if (value === undefined) {
                    if (required) {
                        throw new Error("Cannot set required outgoing edge to undefined");
                    }
                    edge?.delete()
                    // this.triggerPropertyChange(context.name)
                    return
                }

                // Create or update edge
                if (edge) {
                    edge.delete()
                }
                new GraphEdge(this, value, edgeName)

                // this.triggerPropertyChange(context.name)
            },
            init(value) {
                this.outgoing.on('beforeAdd', edge => {
                    if (edge.name != edgeName) return
                    const newItem = edge.destination

                    // Check subclass
                    const isSubclass = newItem instanceof itemType
                    const allowed = isSubclass
                    if (!allowed) {
                        return `Failed to set edge to node: ${newItem} is not a subclass of ${itemType}`
                    }

                    // Check amount
                    for (const _edge of this.outgoing) {
                        if (_edge.name !== edgeName) continue
                        if (_edge.destination instanceof itemType)
                            return `Failed to set edge to node: ${newItem} is already connected to ${edge.destination}`
                    }
                })

                this.outgoing.on('afterAddValidated', edge => {
                    if (edge.name != edgeName) return
                    this.triggerPropertyChange(context.name)
                })

                this.outgoing.on('afterDeleteValidated', edge => {
                    if (edge.name != edgeName) return
                    this.triggerPropertyChange(context.name)
                })

                return value
            },
        }
    }
}




type ClassAccessorDecorator<This, T> = (target: ClassAccessorDecoratorTarget<This, T>, context: ClassAccessorDecoratorContext<This, T>) => ClassAccessorDecoratorResult<This, T>

// function accessorDecorator<This, T>(): ClassAccessorDecorator<This, T> {
//     return (target, context) => {
//         console.log('accessorDecorator body', { target, context })

//         let internalValue: Record<symbol, T> = {}

//         const useInternalValue = true

//         const getInternalValue = (_this: any) => {
//             if (useInternalValue)
//                 return internalValue[_this[`#__decorator_key`]]

//             return target.get.call(_this)
//         }
//         const setInternalValue = (_this: any, value: T) => {
//             if (useInternalValue)
//                 internalValue[_this[`#__decorator_key`]] = value

//             target.set.call(_this, value)
//         }
//         const initInternalValue = (_this: any, value: T) => {
//             _this[`#__decorator_key`] = Symbol()
//             internalValue[_this[`#__decorator_key`]] = value
//         }

//         return {
//             get() {
//                 console.log('get called')
//                 const result = getInternalValue(this)
//                 console.log('result', result)
//                 return result
//             },
//             set(value: any) {
//                 console.log('set called with', value)
//                 setInternalValue(this, value)
//             },
//             init(value: T) {
//                 console.log('init called', { value })
//                 initInternalValue(this, value)
//                 return value
//             }
//         }
//     }
// }