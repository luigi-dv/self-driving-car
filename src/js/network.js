class NeuralNetwork{
    constructor(neuronCounts,hiddenActivation="step"){
        this.levels=[];
        for(let i=0;i<neuronCounts.length-1;i++){
            const isOutput=i==neuronCounts.length-2;
            this.levels.push(new Level(
                neuronCounts[i],neuronCounts[i+1],
                isOutput?"step":hiddenActivation
            ));
        }
    }

    static feedForward(givenInputs,network){
        let outputs=Level.feedForward(
            givenInputs,network.levels[0]);
        for(let i=1;i<network.levels.length;i++){
            outputs=Level.feedForward(
                outputs,network.levels[i]);
        }
        return outputs;
    }

    static clone(network){
        return JSON.parse(JSON.stringify(network));
    }

    static matches(networkA,networkB){
        if(!networkA || !networkB
            || !Array.isArray(networkA.levels)
            || !Array.isArray(networkB.levels)
            || networkA.levels.length!=networkB.levels.length){
            return false;
        }
        for(let i=0;i<networkA.levels.length;i++){
            const levelA=networkA.levels[i];
            const levelB=networkB.levels[i];
            if(!Array.isArray(levelA.weights)
                || !Array.isArray(levelA.biases)
                || levelA.weights.length!=levelB.weights.length
                || levelA.biases.length!=levelB.biases.length){
                return false;
            }
        }
        return true;
    }

    static mutate(network,amount=1){
        network.levels.forEach(level => {
            for(let i=0;i<level.biases.length;i++){
                level.biases[i]=lerp(
                    level.biases[i],
                    Math.random()*2-1,
                    amount
                )
            }
            for(let i=0;i<level.weights.length;i++){
                for(let j=0;j<level.weights[i].length;j++){
                    level.weights[i][j]=lerp(
                        level.weights[i][j],
                        Math.random()*2-1,
                        amount
                    )
                }
            }
        });
    }
}

class Level{
    constructor(inputCount,outputCount,activation="step"){
        this.inputs=new Array(inputCount);
        this.outputs=new Array(outputCount);
        this.biases=new Array(outputCount);
        this.activation=activation;

        this.weights=[];
        for(let i=0;i<inputCount;i++){
            this.weights[i]=new Array(outputCount);
        }

        Level.#randomize(this);
    }

    static #randomize(level){
        for(let i=0;i<level.inputs.length;i++){
            for(let j=0;j<level.outputs.length;j++){
                level.weights[i][j]=Math.random()*2-1;
            }
        }

        for(let i=0;i<level.biases.length;i++){
            level.biases[i]=Math.random()*2-1;
        }
    }

    static feedForward(givenInputs,level){
        for(let i=0;i<level.inputs.length;i++){
            level.inputs[i]=givenInputs[i];
        }

        for(let i=0;i<level.outputs.length;i++){
            let sum=0
            for(let j=0;j<level.inputs.length;j++){
                sum+=level.inputs[j]*level.weights[j][i];
            }

            level.outputs[i]=Activation.apply(
                level.activation,
                sum-level.biases[i]
            );
        }

        return level.outputs;
    }
}

class Activation{
    static apply(name,value){
        switch(name){
            case "sigmoid":
                return Activation.sigmoid(value);
            case "tanh":
                return Activation.tanh(value);
            case "relu":
                return Activation.relu(value);
            default:
                return Activation.step(value);
        }
    }

    static step(value){
        return value>0?1:0;
    }

    static sigmoid(value){
        return 1/(1+Math.exp(-value));
    }

    static tanh(value){
        return Math.tanh(value);
    }

    static relu(value){
        return Math.max(0,value);
    }
}