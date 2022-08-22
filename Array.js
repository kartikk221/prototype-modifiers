// Asynchronously iterates through an array in order, awaiting an async callback for each element.
Array.prototype.forEachAsync = async function (callback, thisArg) {
    // Iterate through each element in the array
    for (let i = 0; i < this.length; i++) {
        // Retrieve the promise from the callback
        const promise = callback.call(thisArg, this[i], i, this);

        // Throw if promise is not a promise
        if (!(promise instanceof Promise))
            throw new Error('Array.forEachAsync: callback must be async or return a promise');

        // Wait for the promise to resolve
        await promise;
    }
};

// Asynchronously iterates through an array in parallel, awaiting all async callbacks from all elements in parallel.
Array.prototype.forEachParallelAsync = async function (callback, thisArg) {
    // Initialize an empty array to hold promises for each element
    const promises = [];

    // Iterate through each element in the array
    for (let i = 0; i < this.length; i++) {
        // Retrieve the promise from the callback
        const promise = callback.call(thisArg, this[i], i, this);

        // Throw if promise is not a promise
        if (!(promise instanceof Promise))
            throw new Error('Array.forEachParallelAsync: callback must be async or return a promise');

        // Add the promise to the array of promises
        promises.push(promise);
    }

    // Wait for all the promises to resolve
    await Promise.all(promises);
};

// Asynchronously iterates through an array in synchronous batches of size iterations, synchronously executing the callback for each value.
Array.prototype.forEachThrottledAsync = async function (iterations, callback, thisArg) {
    // Ensure iterations is a positive integer
    if (typeof iterations !== 'number' || iterations < 1)
        throw new Error('Array.forEachThrottledAsync: iterations must be a positive integer');

    // Calculate the number of synchronous execution sets to perform
    const multiple = this.length > iterations;
    const executions = multiple ? Math.ceil(this.length / iterations) : this.length;

    // Iterate for each execution set
    for (let i = 0; i < executions; i++) {
        // Calculate the start and end indices for the current execution set
        const start = i * iterations;
        const end = Math.min(start + iterations, this.length);
        for (let j = start; j < end; j++) {
            // Synchronously execute the callback for the current element
            callback.call(thisArg, this[j], j, this);
        }

        // Flush the event loop if we have not reached the end of the array and have multiple execution sets
        if (multiple && end < this.length) await new Promise((resolve) => setTimeout(resolve, 0));
    }
};
