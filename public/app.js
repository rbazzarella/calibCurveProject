const genInputsBt = document.querySelector("button");
const genInputsForm = document.querySelector("#genInputs");
const numbOfCalInp = document.querySelector("#numberOfCalib");
const weightingFactor = document.querySelector("#weightingFactor");
const areasFormEl = document.querySelector("#areasForm");
const gridContainer = document.querySelector(".grid-container");

const calPointsDiv = document.querySelector("#calPoints");
const calAreasDiv = document.querySelector("#calAreas");
const PIAreasDiv = document.querySelector("#PIAreas");

function generateInputs(e) {
    e.preventDefault();

    const numberOfCalibPoints = numbOfCalInp.value;

    if(numberOfCalibPoints <= 2) {
      alert("Number of calibration points should be at least 3 or above");
      return;
    }

    for(let i = 1; i <= numberOfCalibPoints; i++) {
        const concEl = document.createElement("input");
        const checkBoxEl = document.createElement("input");
        const areaEl = document.createElement("input");
        const PIAreaEl = document.createElement("input");
        const br1 = document.createElement("br");
        const br2 = document.createElement("br");
        const br3 = document.createElement("br");        
       
        concEl.setAttribute('class', 'concInput');
        concEl.setAttribute('placeholder', 'calibration ' + i + ' point');

        checkBoxEl.setAttribute('type', 'checkbox');
        checkBoxEl.setAttribute('class', 'checkBoxInput');

        areaEl.setAttribute('class', 'areaInput');
        areaEl.setAttribute('placeholder', 'calibration ' + i + ' area');

        PIAreaEl.setAttribute('class', 'PIAreaInput');
        PIAreaEl.setAttribute('placeholder', 'PI area of cal ' + i);

        calPointsDiv.append(concEl, checkBoxEl, br1);
        calAreasDiv.append(areaEl, br2);
        PIAreasDiv.append(PIAreaEl, br3);
    }

    const resultBt = document.createElement("button");
    resultBt.setAttribute('id', 'calibResult');
    resultBt.setAttribute('type', 'submit');
    resultBt.innerHTML = "generate curve";
    areasFormEl.append(resultBt);
    numbOfCalInp.setAttribute('disabled', 'true');
    genInputsBt.style.visibility = 'hidden';
}

genInputsForm.addEventListener('submit', generateInputs);

function calculateCurve(e) {  
    e.preventDefault();

    const wfVal = weightingFactor.value;

    const concInputs = document.getElementsByClassName('concInput');
    const areaInputs = document.getElementsByClassName('areaInput');
    const PIAreaInputs = document.getElementsByClassName('PIAreaInput');
    const checkBoxInputs = document.getElementsByClassName('checkBoxInput');

    for(let i = 0; i < concInputs.length; i++) {
      if(isNaN(concInputs[i].value) || isNaN(areaInputs[i].value) || isNaN(PIAreaInputs[i].value)) {
        alert("Insert only numbers on the fields");
        return;
      }
    }

    for(let i = 0; i < concInputs.length; i++) {
      if(concInputs[i].value === "" || areaInputs[i].valu === "" || PIAreaInputs[i].value === "") {
        alert("The fields cannot be blank");
        return;
      }
    }

    const concentrations = [];
    const areas = [];
    const PIAreas  = [];
    const areaDivPI = [];

    for(let i = 0; i < concInputs.length; i++) {
      if(checkBoxInputs[i].checked === false) {
        concentrations.push(Number(concInputs[i].value));
        areas.push(Number(areaInputs[i].value));
        PIAreas.push(Number(PIAreaInputs[i].value));
      }
    }

    //line through discharded points
    for(let i = 0; i < concInputs.length; i++) {
      if(checkBoxInputs[i].checked === true) {
        concInputs[i].style.textDecoration = "line-through";
        areaInputs[i].style.textDecoration = "line-through";
        PIAreaInputs[i].style.textDecoration = "line-through";
        concInputs[i].style.background = "#FF5555";
        areaInputs[i].style.background = "#FF5555";
        PIAreaInputs[i].style.background = "#FF5555";
      } else {
        concInputs[i].style.textDecoration = "none";
        areaInputs[i].style.textDecoration = "none";
        PIAreaInputs[i].style.textDecoration = "none";
        concInputs[i].style.background = "white";
        areaInputs[i].style.background = "white";
        PIAreaInputs[i].style.background = "white";
      }
    }

    const n = concentrations.length;

    for(let i = 0; i < n; i++) {
      areaDivPI.push(areas[i]/PIAreas[i]);
    }
   
    let wf;
    switch(wfVal) {
      case('none'):
        wf = concentrations.map(el => el/el);
        break;
      case('1/x'):
        wf = concentrations.map(el => 1/el);
        break;
      case('1/x²'):
        wf = concentrations.map(el => 1/Math.pow(el, 2));
        break;
    }

    const wiSum = wf.reduce((a, b) => a + b);
   
    let wixiyiSum = 0;
    let wixiSum = 0;
    let wiyiSum = 0;
    let wixi2Sum = 0;

    for(let i = 0; i < n; i++) {
      wixiyiSum += (areaDivPI[i]*concentrations[i]*wf[i]);
      wixiSum += (concentrations[i]*wf[i]);
      wiyiSum += (areaDivPI[i]*wf[i]);
      wixi2Sum += (Math.pow(concentrations[i], 2)*wf[i]);
    }

    const wixiSum2 = Math.pow(wixiSum, 2);

    const slopeNum = wiSum * wixiyiSum - (wixiSum * wiyiSum);
    const slopeDenom = wiSum * wixi2Sum - wixiSum2;
    const slope = slopeNum/slopeDenom;

    const interceptNum = (wixi2Sum * wiyiSum) - (wixiSum * wixiyiSum);
    const interceptDenom = wiSum * wixi2Sum - wixiSum2;
    const intercept = interceptNum / interceptDenom;

    const concValues = [];
    for(let i = 0; i < n; i++) {
      concValues.push((areaDivPI[i] - intercept) / slope)
    }

    for(let i = 0; i < concValues.length; i++) {
      concValues[i] = concValues[i].toFixed(2);
    }

    //calculating R squared:
    const yPred = [];
    for(let i = 0; i < n; i++) {
      yPred.push(intercept + (slope * concentrations[i]));
    }

    const yPredds = [];
    for(let i = 0; i < n; i++) {
      yPredds.push(Math.pow(yPred[i] - areaDivPI[i], 2));
    }

    const yPreddsSum = yPredds.reduce((a, b) => a + b);

    const yWMDS = [];
    for(let i = 0; i < n; i++) {
      yWMDS.push(Math.pow(areaDivPI[i] - (wiyiSum/wiSum), 2));
    }

    const yWMDSSum = yWMDS.reduce((a, b) => a + b);

    const rSquared  = (yWMDSSum - yPreddsSum) / yWMDSSum;

    document.querySelector("#result").innerHTML = concValues.join("<br>");

    intercept > 0? document.querySelector("#calibrationCurve").innerHTML = "y = " + slope.toFixed(6) + "x" + " + " + intercept.toFixed(6) + "<br/>R²: " + rSquared :
               document.querySelector("#calibrationCurve").innerHTML = "y = " + slope.toFixed(6) + "x " + intercept.toFixed(6) + "<br/>R²: " + rSquared;

    genGraph(concentrations, areaDivPI, slope, intercept);

}

areasFormEl.addEventListener('submit', calculateCurve);

//------------------------------------------------------------------------------

function genGraph(concs, areas, slp, interc) {

  document.querySelector("#graph").innerHTML = "";

  const margin = {
    top: 20,
    right: 40,
    bottom: 50,
    left: 60
  };

  const width = 500 - margin.left - margin.right;

  const height = 250 - margin.top - margin.bottom;

  const data = [];

  for(let i = 0; i < concs.length; i++) {
      data.push({x: concs[i], y: areas[i]});
  }

  const graphIntercep = (interc*height)/areas[areas.length-1];

  const endIntercep = (concs[concs.length-1] * slp + interc) * height/areas[areas.length-1];

  const svg = d3.select("#graph")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleLinear()
    .domain([0, concs[concs.length-1]])
    .range([0, width]);

  //x label
  svg
     .append("text")
     .attr("class", "x label")
     .attr("text-anchor", "end")
     .attr("x", width)
     .attr("y", height + 35)
     .text("concentrations");

  svg
     .append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x));

  const y = d3.scaleLinear()
            .domain([0, areas[areas.length-1]])
            .range([height, 0]);

  //y label
  svg
     .append("text")
     .attr("class", "y label")
     .attr("text-anchor", "end")
     .attr("y", 6)
     .attr("dy", ".75em")
     .attr("transform", "rotate(-90)")
     .text("response (A/PI)");

  svg
     .append("g")
     .call(d3.axisLeft(y));

  //draw cal points  
  svg
     .selectAll("whatever")
     .data(data)
     .enter()
     .append("circle")
       .attr("cx", function(d){return x(d.x)})
       .attr("cy", function(d){return y(d.y)})
       .attr("r", 4);

  //draw graph line    
  svg
    .append('line')
    .style("stroke", "skyBlue")
    .style("stroke-width", 3)
    .attr("x1", 0)
    .attr("y1", height - graphIntercep)
    .attr("x2", width)
    .attr("y2", height - endIntercep)

}