var lastBadBlock = {
    "block":null,
    "colour":null
}
function submitPlan(plan)
{
    let loader = document.getElementById("submission-loader");
    loader.style.display = "block";
    clearMsg('status'); // only clear the tmp status. Leave the explainer status intact.
    
    // Unset bad block colour if it was ever set
    if (lastBadBlock['block'] !== null){
        if (workspace.getBlockById(lastBadBlock['block'].id) !== null){
            lastBadBlock['block'].setColour(lastBadBlock['colour']);
            lastBadBlock['block'] = null;
            lastBadBlock['colour'] = null;
        }
    }

    let plan_all = "";
    for(let a = 0; a < plan.length; a++){
        plan_all += plan[a]["action_name"] + " " + plan[a]["params"].join(" ");
        if(a < plan.length-1)
            plan_all += ",";
    }

    let call_tmp = function() {
        console.log("Calling TMP...")
        $.ajax({
            url: "start_TMP",
            type: "GET"
        }).done(function(data) { 
            console.log("TMP started again");
        })
    }

    $.ajax({
        url: "plan_submit",
        type: 'GET',
        data: { plan: plan_all },
    }).done(function(data) {
        plan_all = data.execution_plan;
        if (data.success === "True") {
            let successCallMsg = "VALID: Plan correct! TMP will execute all the actions."
            showMsg(successCallMsg, "pass","explainer_status");
            explainer_success = "pass";
        }
        else {
            // Do all the colour checking ops only if the explainer returns a failed precondition
            if ("failed_precondition" in data.explanation_map){
                if ("badStep" in data.explanation_map){
                    let badStep = parseInt(data.explanation_map.badStep);
                    let theBlocks = workspace.getAllBlocks(true);
                    lastBadBlock['block'] = theBlocks[badStep+1];
                    lastBadBlock['colour'] = theBlocks[badStep+1].getColour();
                    lastBadBlock['block'].setColour("#793535");
                }
            }

            loader.style.display = "none";
            let failureCallMsg = "ERROR: Plan is only partially correct. " + data.explanation_map["failure_cause"];
            showMsg(failureCallMsg , "fail","explainer_status");
            explainer_success = "fail";
        }

        // Only call TMP if the plan is not empty
        // An empty plan submission would never reach here normally but a pruned plan may be empty even if there are action blocks set up in the workspace
        if (plan_all != ''){
            let generalTMPFillerMsg = "INFO: Calling TMP to convert plan to robot movements. You may see some movement in the 3D environment window as computations take place.";
        showMsg(generalTMPFillerMsg, "inprogress", "status")    
        
        $.ajax({
            url: "call_TMP",
            type: 'GET',
            data: { plan: plan_all }
        }).done(function(data) {
            console.log("TMP_______CALLED");
            if (data.success === "True") {
                let finishedComputingAlert = "TMP finished computing. Close this alert to allow your plan to begin executing, then watch the 3D environment window!";
                let finishedComputingMsg = "INFO: Watch the 3D environment window to see your plan being executed!"
                showMsg(finishedComputingMsg, "inprogress","status");
                $.ajax({
                    url: 'run_plan',
                    type: 'GET',
                    beforeSend: alert(finishedComputingAlert)
                }).done(function(data) {
                    let tmpCompletionAlert = "Plan executed successfully! Close this alert to reset the 3D environment.";
                    let tmpCompletionMsg = "INFO: Plan execution complete!";
                    showMsg(tmpCompletionMsg, "inprogress","status");
                    $.ajax({
                        url: 'kill_tmp',
                        type: 'GET',
                        beforeSend: alert(tmpCompletionAlert)
                    }).done(function(data){
                        call_tmp();
                    });
                });
            }
            else {
                let tmpErrorAlert = "TMP reported failure. If the 3D environment window doesn't open again, you may need to restart JEDAI.";
                showMsg(tmpErrorAlert, "fail");
                alert(tmpErrorAlert);
                call_tmp();
            }
            loader.style.display = "none";
                });
            }
    });
}
