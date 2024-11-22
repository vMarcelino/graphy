// import { GraphNode } from ".";
// import { OutgoingNodeList, IncomingNodeList } from "./NodeList";
// import { notifyingProperty } from "./Edge";
// import { query } from "./Query";

// function logme(target: any, context: any) {
//     console.log('logme called', context)
// }

// class Pipo extends GraphNode { }

// class Person extends GraphNode {
//     // @notifyingProperty('', Pipo, 'incoming')
//     // accessor pipipi: string = 'yot'

//     @logme
//     somefunc() {
//         return 3
//     }

//     constructor(public name: string, public sex: "M" | "F") {
//         super()
//     }
//     parents = new OutgoingNodeList(this, "parent", Person)
//     children = new IncomingNodeList(this, "parent", Person)
//     knows = new OutgoingNodeList(this, "knows", Person)

//     addParents(p1: Person, p2: Person) {
//         this.parents.push(p1)
//         this.parents.push(p2)
//     }

//     getDad() {
//         return query.throughEdge(this.parents).filter(p => p.sex === "M").execute(this)
//     }
// }

// const p1 = new Person("Victor", "M")
// const p2 = new Person("Sergio", "M")
// const p3 = new Person("Nilda", "F")

// p1.addParents(p2, p3)

// console.log(p1.getDad())
// p1.somefunc()