# NOT FINISHED
This was an experiment to test the performance of nodejs with **tensorflow-js**. Their were not significant differences to the browser version, since it is not optimized for **neuro-evolution**.

# Teaching a drone how to fly
After seeing the epic [project](https://github.com/johnBuffer/AutoDrone) of [John Buffer](https://github.com/johnBuffer), I decided to give it a shot myself to create something similar.

My version is written in typescript, you are able to directly try it in your [browser](https://sch-28.github.io/Drone/). 

## Approach
The training consists of 9 targets. For each target, each drone has a **set time to reach** it.
Reaching means to not only hit the target, but to also **stay** on the position for a while.
If they don't reach their current target at the end of the time, they are destroyed. The time gets reset when the drone stayed long enough on top of the target.
A next generation will be initialized if each drone is either destroyed or if all targets have been reached.

The next generation is created by letting all the drones reproduce based on their performance.
The performance is the normalized score of each drone. The score determined by their:
- distance to their current target each iteration
- how many targets they successfully reached
- time it took to reach each target


After two parents have been chosen for a new child-drone, there will be a chance for mutations.
Through mutations, there is the possibility of discovering a new behavior which might yield better results. In **evolutionary algorithms**, it is normally also required to perform a cross-over between the parents. This however has not yet been implemented.

## Actual Training
To achieve the current used drone, I let the website run for 10+ hours. Depending on your luck/hardware, it may take less or more time.<br>
I usually trained with 200 drones per generation - which still ran fine on my pc.

## Missing / Improvements
- A big bottleneck is [tensorflow-js](https://github.com/tensorflow/tfjs). **Tensorflow** is made for anything but **neuro-evolution** and is slowing down the training a lot. Actual implementations of the **neat algorithm** would improve this project by a lot.
- Adding cross-over to improve the algorithm.
- Finishing the _nodejs server_ to allow easier training.
