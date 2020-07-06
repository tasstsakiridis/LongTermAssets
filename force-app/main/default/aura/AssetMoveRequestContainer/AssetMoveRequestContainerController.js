({
	doInit : function(component, event, helper) {
        var myPageRef = component.get("v.pageReference");
        if (myPageRef != null) {
            var accountId = myPageRef.state.c__accountId;
            var assetId = myPageRef.state.c__assetId;
            component.set("v.accountId", accountId);
            component.set("v.assetId", assetId);        
        }
        console.log('[assetmoverequestcontainer.init] recordId', component.get("v.recordId"));
        var action = component.get("c.getRecordType");
        action.setParams({
            "recordId" : component.get("v.recordId")
        });
        action.setCallback(this, function(response){
            var callState = response.getState();
            console.log('[assetmoverequest.controller.getRecordType] getRecordType action callback returned with state', callState);
            
            if (component.isValid()) {
                if (callState === "SUCCESS") {
                    try {                        
    	                var recordType = response.getReturnValue();
                        component.set("v.objectType", recordType);
	                    console.log('[assetmoverequest.controller.getRecordType] recordtype', recordType);

                    } catch(ex1) {
                        console.log('[assetmoverequest.controller.getRecordType] exception', ex1);
                    }
                    
                } else if (callState === "INCOMPLETE") {
                    console.log('[assetmoverequest.controller.getRecordType] callback state is incomplete');    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log('[assetmoverequest.controller.getRecordType] callback returned errors. ', errors);                    
                    component.set("v.errors", errors);                    
                }
            }
            
        });
        $A.enqueueAction(action);
	}
})