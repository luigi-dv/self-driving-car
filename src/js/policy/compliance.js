class ComplianceRecord{
    constructor(){
        this.penalty=0;
        this.violations=[];
        this.disqualified=false;
    }

    add(rule,violation){
        this.violations.push({
            rule:rule,
            severity:violation.severity,
            message:violation.message
        });
        if(violation.severity=="HARD"){
            this.disqualified=true;
        }else{
            this.penalty+=Settings.fitness.softPenalty;
        }
    }

    get last(){
        return this.violations[this.violations.length-1]||null;
    }
}
