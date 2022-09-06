import {
    TaskGraph,
    EventListenerGenerator,
    RunnableTaskDescriptor,
} from "nativescript-task-dispatcher/tasks/graph";

class DemoTaskGraph implements TaskGraph {
    async describe(
        on: EventListenerGenerator,
        run: RunnableTaskDescriptor
    ): Promise<void> {
        on(
            "startEvent",
            //replace 2 minutes with input 
            //need tp somehow project the stopevent from the stop button 
            run("record").every(2, "minutes").cancelOn("stopEvent")
        );
    }
}

export const demoTaskGraph = new DemoTaskGraph();