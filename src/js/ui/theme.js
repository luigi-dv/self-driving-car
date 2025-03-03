// Colours of everything drawn on a canvas. The canvases are transparent,
// so the page ground shows around the road. One accent, green, for what
// is live: the sensor rays, the directive, a neuron that fired
const Theme={
    road:"rgba(255,255,255,0.07)",
    laneMark:"rgba(236,238,235,0.55)",
    roadEdge:"#ECEEEB",
    lineWidth:3,

    carBest:"#ECEEEB",
    carLearning:"#8F9692",
    carDamaged:"#5C625E",
    learningAlpha:0.25,
    traffic:["#9AA4AD","#B3AA98","#8D9BA6","#A99BA6"],
    trafficSpecial:"#ECEEEB",

    ray:"#62C370",
    rayBlocked:"rgba(236,238,235,0.14)",
    directive:"#62C370",

    rampSurface:"rgba(255,255,255,0.07)",
    rampEdge:"#ECEEEB",
    rampDivider:"rgba(236,238,235,0.55)",
    closureFill:"rgba(240,119,107,0.16)",
    closureEdge:"#F0776B",
    closureCone:"#F0776B",

    lampSignal:"#FFA630",
    lampHighBeam:"#FFFFFF",
    lampEmergencyA:"#FF4D5E",
    lampEmergencyB:"#4D84FF",

    nodeFill:"rgba(255,255,255,0.10)",
    nodeRing:"rgba(0,0,0,0)",
    weightPositive:[98,195,112],
    weightNegative:[236,238,235],
    inputPositive:[98,195,112],
    outputLabel:"#ECEEEB",

    chartAxis:"rgba(236,238,235,0.6)",
    chartBest:"#ECEEEB",
    chartAverage:"rgba(236,238,235,0.45)",

    font:"system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
};
