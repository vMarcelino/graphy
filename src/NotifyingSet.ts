type Callbacks<T> = {
    /** Called before an item is added to the set. Return false or a string indicating the error to cancel the addition */
    beforeAdd: Set<(item: T) => (boolean | void | string)>

    /** Called after an item is added to the set */
    afterAddValidated: Set<(item: T) => void>

    /** Called before an item is deleted from the set. Return false or a string indicating the error to cancel the deletion */
    beforeDelete: Set<(item: T) => (boolean | void | string)>

    /** Called after an item is deleted from the set */
    afterDeleteValidated: Set<(item: T) => void>
}

type GetCallbackType<T, K extends keyof Callbacks<T>> = Callbacks<T>[K] extends Set<infer T> ? T : never

export class NotifyingSet<T> extends Set<T> {
    private callbacks: Callbacks<T> = {
        beforeAdd: new Set(),
        afterAddValidated: new Set(),
        beforeDelete: new Set(),
        afterDeleteValidated: new Set(),
    }

    /** Inject a callback to the set. Returns a function that removes the callback once called */
    on<K extends keyof Callbacks<T>>(event: K, callback: GetCallbackType<T, K>) {
        this.callbacks[event].add(callback as any)
        return () => { this.callbacks[event].delete(callback as any) }
    }

    add(value: T): this {
        for (const callback of this.callbacks.beforeAdd) {
            const result = callback(value)
            if(result === false){
                throw new Error("Failed to add item to set: validation failed on one of the callbacks");
            }
            else if(typeof result === 'string'){
                throw new Error(result);
            }
        }

        super.add(value)

        this.callbacks.afterAddValidated.forEach(callback => callback(value))

        return this
    }

    delete(value: T): boolean {
        for (const callback of this.callbacks.beforeDelete) {
            const result = callback(value)
            if(result === false){
                throw new Error("Failed to delete item from set: validation failed on one of the callbacks");
            }
            else if(typeof result === 'string'){
                throw new Error(result);
            }
        }

        const result = super.delete(value)

        if(result){
            this.callbacks.afterDeleteValidated.forEach(callback => callback(value))
        }

        return result
    }
}