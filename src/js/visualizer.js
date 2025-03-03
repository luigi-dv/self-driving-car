class Visualizer{
    static drawNetwork(ctx,network){
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

        const margin=clamp(ctx.canvas.width*0.08,24,50);
        const left=margin;
        const top=margin;
        const width=ctx.canvas.width-margin*2;
        const height=ctx.canvas.height-margin*2;

        const levelHeight=height/network.levels.length;

        // One radius for every row, set by the widest one
        const widest=Math.max(...network.levels.map(
            level=>Math.max(level.inputs.length,level.outputs.length)
        ));
        const nodeRadius=clamp(
            (widest>1?width/(widest-1):width)*0.4,8,18
        );

        for(let i=network.levels.length-1;i>=0;i--){
            const levelTop=top+
                lerp(
                    height-levelHeight,
                    0,
                    network.levels.length===1
                        ?0.5
                        :i/(network.levels.length-1)
                );

            ctx.setLineDash([7,3]);
            Visualizer.drawLevel(ctx,network.levels[i],
                left,levelTop,
                width,levelHeight,
                i===network.levels.length-1
                    ?['↑','←','→','↓']
                    :[],
                nodeRadius,
                i===0
            );
        }
    }

    static drawLevel(ctx,level,left,top,width,height,outputLabels,nodeRadius,isInputLevel){
        const right=left+width;
        const bottom=top+height;

        const {inputs,outputs,weights,biases}=level;

        for(let i=0;i<inputs.length;i++){
            for(let j=0;j<outputs.length;j++){
                ctx.beginPath();
                ctx.moveTo(
                    Visualizer.#getNodeX(inputs,i,left,right),
                    bottom
                );
                ctx.lineTo(
                    Visualizer.#getNodeX(outputs,j,left,right),
                    top
                );
                ctx.lineWidth=2;
                ctx.strokeStyle=getRGBA(weights[i][j]);
                ctx.stroke();
            }
        }

        for(let i=0;i<inputs.length;i++){
            const x=Visualizer.#getNodeX(inputs,i,left,right);
            ctx.beginPath();
            ctx.arc(x,bottom,nodeRadius,0,Math.PI*2);
            ctx.fillStyle=Theme.nodeFill;
            ctx.fill();
            ctx.lineWidth=1.5;
            ctx.strokeStyle=Theme.nodeRing;
            ctx.setLineDash([]);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x,bottom,nodeRadius*0.6,0,Math.PI*2);
            ctx.fillStyle=isInputLevel
                ?getInputRGBA(inputs[i])
                :getRGBA(inputs[i]);
            ctx.fill();
        }

        for(let i=0;i<outputs.length;i++){
            const x=Visualizer.#getNodeX(outputs,i,left,right);
            ctx.beginPath();
            ctx.arc(x,top,nodeRadius,0,Math.PI*2);
            ctx.fillStyle=Theme.nodeFill;
            ctx.fill();
            ctx.lineWidth=1.5;
            ctx.strokeStyle=Theme.nodeRing;
            ctx.setLineDash([]);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x,top,nodeRadius*0.6,0,Math.PI*2);
            ctx.fillStyle=getRGBA(outputs[i]);
            ctx.fill();

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.arc(x,top,nodeRadius*0.8,0,Math.PI*2);
            ctx.strokeStyle=getRGBA(biases[i]);
            ctx.setLineDash([3,3]);
            ctx.stroke();
            ctx.setLineDash([]);

            if(outputLabels[i]){
                ctx.beginPath();
                ctx.textAlign="center";
                ctx.textBaseline="middle";
                ctx.fillStyle=Theme.outputLabel;
                ctx.font="600 "+Math.round(nodeRadius*1.1)+"px "+Theme.font;
                ctx.fillText(outputLabels[i],x,top+nodeRadius*0.1);
            }
        }
    }

    static #getNodeX(nodes,index,left,right){
        return lerp(
            left,
            right,
            nodes.length===1
                ?0.5
                :index/(nodes.length-1)
        );
    }
}
