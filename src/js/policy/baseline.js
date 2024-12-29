// A hand-built starting brain that follows the directive: it steers
// towards the lane it is given and holds the speed it is given. The
// sensors are left unconnected, evolution wires them in from here.
class BaselineBrain{
    static create(rayCount){
        if(Car.hiddenLayers.length!=1
            || Car.hiddenLayers[0]<4
            || Car.hiddenActivation!="step"){
            return null;
        }

        const network=new NeuralNetwork(
            [rayCount+Car.guidanceCount,...Car.hiddenLayers,4],
            Car.hiddenActivation
        );
        network.levels.forEach(level=>{
            level.biases.fill(1);
            level.weights.forEach(weights=>weights.fill(0));
        });

        const [hidden,output]=network.levels;
        const lane=rayCount;
        const speed=rayCount+1;
        const heading=rayCount+2;
        const STEER_LEFT=0,STEER_RIGHT=1,SPEED_UP=2,SLOW_DOWN=3;

        // Head towards the lane, about 0.4 rad for a full lane away
        hidden.weights[lane][STEER_LEFT]=-0.5;
        hidden.weights[heading][STEER_LEFT]=-1;
        hidden.biases[STEER_LEFT]=0.04;
        hidden.weights[lane][STEER_RIGHT]=0.5;
        hidden.weights[heading][STEER_RIGHT]=1;
        hidden.biases[STEER_RIGHT]=0.04;

        hidden.weights[speed][SPEED_UP]=1;
        hidden.biases[SPEED_UP]=0;
        hidden.weights[speed][SLOW_DOWN]=-1;
        hidden.biases[SLOW_DOWN]=0.05;

        // Outputs: forward, left, right, reverse
        output.weights[SPEED_UP][0]=1;
        output.weights[STEER_LEFT][1]=1;
        output.weights[STEER_RIGHT][2]=1;
        output.weights[SLOW_DOWN][3]=1;
        output.biases.fill(0.5);

        return network;
    }
}
