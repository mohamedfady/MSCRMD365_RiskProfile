
var Id = null; //  id
var AccountID = null;

function getQueryStrings(queryStringParam) {
    var assoc = {};
    //.replace(/%/g, " ")
    var decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };

    var queryString = "";
    if (queryStringParam == null || queryStringParam == "") {
        queryString = location.search.substring(1);
    }
    else {
        queryString = queryStringParam;
    }

    var keyValues = queryString.split('&');

    for (var i in keyValues) {
        var key = keyValues[i].split('=');
        if (key.length > 1) {
            assoc[decode(key[0])] = decode(key[1]);
        }
    }
    return assoc;
}

function ODataRequestJSONParsed(oDataRequestString) {

    var retrieveEventListsReq = new XMLHttpRequest();

    var serverUrl = Xrm.Page.context.getClientUrl();

    var oDataPath = serverUrl;

    oDataPath += oDataRequestString;

    retrieveEventListsReq.open("GET", oDataPath, false);

    retrieveEventListsReq.setRequestHeader("Accept", "application/json");

    retrieveEventListsReq.setRequestHeader("Content-Type", "application/json; charset=utf-8");

    retrieveEventListsReq.send();

    if (retrieveEventListsReq.status == 200) {

        //Success

        return retrieveEventListsReq.responseText;

    }

    else {

        return null;

        //alert("No Results");

    }

}

function ChangeDropdowns(value) {
    if (value == "3") {
        document.getElementById('trCommentlbl').style.display = '';
        document.getElementById('trCommenttxt').style.display = '';
    } else if (value == "4") {
        document.getElementById('trCommentlbl').style.display = '';
        document.getElementById('trCommenttxt').style.display = '';
    }
    else {
        document.getElementById('trCommentlbl').style.display = 'none';
        document.getElementById('trCommenttxt').style.display = 'none';
        document.getElementById('trCommenttxt').value = '';
    }
}

function RiskProfileURL() {
    //debugger;
    var id = Xrm.Page.data.entity.getId();
    if (id != null) {

        var param = encodeURIComponent("id=" + id);

        var serverURL = Xrm.Page.context.getClientUrl();
        var urlWebResource = serverURL + "/WebResources/new_/RiskProfile/RiskProfile.html?data=" + param;

        window.open(urlWebResource, "Risk Profile", "location=1,status=1,scrollbars=1,width=900,height=600");
    }
}

function Submit() {

    debugger;

    var qs = getQueryStrings();
    data = qs["data"];

    if (data == null) return;

    ActualQS = getQueryStrings(data);
    Id = ActualQS["id"];


    //Get Quest 1.Yearly Average Turnover [m€] (number)
    var q1 = document.getElementById('tbq1').value;
    //validate 
    if (isNaN(document.getElementById('tbq1').value)) {
        alert('Please input numeric characters only');
        return;
    }

    //Q2 2.	Why are you trading Financial Instruments?
    var e = document.getElementById("selectQ2");
    var q2 = e.options[e.selectedIndex].text;
    if (q2 == "--select-one--") {
        alert('Please select option');
        return;
    }

    //Q3 3.	Suitable investment objectives (multiple option)

    var chkArray = [];
    /* look for all checkboes that have a parent id called 'checkboxlist' attached to it and check if it was checked */
    $("#checkboxlist input:checked").each(function () {
        chkArray.push($(this).val());
    });
    /* we join the array separated by the comma */
    var q3;
    q3 = chkArray.join(',');
    if (q3.length < 3) {
        alert('Please select option');
        return;
    }

    //Q4 4.	Investment horizon (single option)
    e = document.getElementById("selectQ4");
    var q4 = e.options[e.selectedIndex].text;
    if (q4 == "--select-one--") {
        alert('Please select option');
        return;
    }
    //Q5 5.	Comment (text - visible and required only when 4c or 4d was selected)
    var q5 = document.getElementById('taq5').value;


    //Q6 6.	Experience in Financial Instruments (single option)
    e = document.getElementById("selectQ6");
    var q6 = e.options[e.selectedIndex].text;
    if (q6 == "--select-one--") {
        alert('Please select option');
        return;
    }

    var AccountID = Id.replace("{", "").replace("}", "");

    //check incase there was any profile exist :!

    var ExistRiskprofile = ODataRequestJSONParsed("/api/data/v8.2/new_riskprofiles?$select=new_riskprofileid&$filter=_new_accountid_value eq " + AccountID);
    var jsonres = JSON.parse(ExistRiskprofile);

    if (ExistRiskprofile != undefined && jsonres.value.length > 0) {

        XrmSvcToolkit.updateRecord({
            entityName: "new_riskprofile",
            id: jsonres.value[0].new_riskprofileid,
            entity:
                {
                    new_Q1: q1,
                    new_Q2: q2,
                    new_Q3: q3,
                    new_Q4: q4,
                    new_Q5: q5,
                    new_Q6: q6
                },
            async: false,
            errorCallback: function (error) {
                errorOcured("There was an error when updating the risk profile record");
            }
        });
        alert('Risk Profile Updated OK!');
    }
    else {

        var Riskprofile = XrmSvcToolkit.createRecord({
            entityName: "new_riskprofile",
            entity: {
                new_Q1: q1,
                new_Q2: q2,
                new_Q3: q3,
                new_Q4: q4,
                new_Q5: q5,
                new_Q6: q6,
                new_AccountId: { Id: AccountID, LogicalName: "account" },
            },
            async: false,
            errorCallback: function (error) {
                errorOcured("There was an error when creating the authentication trace record");
            }
        });

        if (Riskprofile.new_riskprofileId != null) {
            alert('Submit OK!');
        }
        else {
            alert('Error in Submit, please contact Administrator!');
        }

    }

    window.close();
}

//var RiskprofilesDataView = new ko.observableArray([]);

function SearchFunc() {
    debugger;
    var AccountName = document.getElementById('tbAccountName').value;
    var AccountNumber = document.getElementById('tbAccountNumber').value;
    var MobileNumber = document.getElementById('tbMobileNumber').value;
    var Accounts = ODataRequestJSONParsed("/api/data/v8.2/accounts?$select=accountid,name&$filter=contains(name, '" + AccountName + "') or contains(telephone1, '" + MobileNumber + "') or contains(accountnumber, '" + AccountNumber + "')");
    var jsonres = JSON.parse(Accounts);

    if (jsonres.value.length > 0) {
        bindData(jsonres.value);
    }

}

function bindData(RiskProfileData) {
    var bodydata = $("#tblGrid tbody");
    bodydata.empty();

    for (var i = 0; i < RiskProfileData.length; i++) {
        var AccountID = RiskProfileData[i].accountid;
        var AccountName = RiskProfileData[i].name;
        var RiskProfileDetail = ODataRequestJSONParsed("/api/data/v8.2/new_riskprofiles?$select=new_q1,new_q2,new_q3,new_q4,new_q5,new_q6,new_riskprofileid&$filter=_new_accountid_value eq " + AccountID);
        var RiskProfileDetailJson = JSON.parse(RiskProfileDetail);
        if (RiskProfileDetailJson.value.length > 0) {
            for (var ii = 0; ii < RiskProfileDetailJson.value.length; ii++) {
                bodydata.append(' <tr ><td class="FirstColumn"> <span class="separator"><input id="btn" type="button" value="Clone" RiskID="' + RiskProfileDetailJson.value[ii].new_riskprofileid + '" AccountID="' + AccountID + '"/> </span></td>'
                    + '<td class="FirstColumn"> <span class="separator">' + AccountName + '</span></td>'
                    + '<td class="FirstColumn"> <span class="separator">' + RiskProfileDetailJson.value[ii].new_q1 + '</span></td>'
                    + '<td class="FirstColumn"> <span class="separator">' + RiskProfileDetailJson.value[ii].new_q2 + '</span></td>'
                    + '<td class="FirstColumn"> <span class="separator">' + RiskProfileDetailJson.value[ii].new_q3 + '</span></td>'
                    + '<td class="FirstColumn"> <span class="separator">' + RiskProfileDetailJson.value[ii].new_q4 + '</span></td>'
                    + '<td class="FirstColumn"> <span class="separator">' + RiskProfileDetailJson.value[ii].new_q5 + '</span></td>'
                    + '<td class="FirstColumn"> <span class="separator">' + RiskProfileDetailJson.value[ii].new_q6 + '</span></td> </tr>');
            }
        }
    }
}


$(document).on("click", "input[RiskID]", function () {

    var qs = getQueryStrings();
    data = qs["data"];

    if (data == null) return;

    ActualQS = getQueryStrings(data);
    Id = ActualQS["id"];
    var targetAccountID = Id.replace("{", "").replace("}", "");
    var sourceAccountID = $(this).attr("AccountID");
    var RiskID = $(this).attr("RiskID");
    //alert(RiskID);

    var sourceRiskprofile = ODataRequestJSONParsed("/api/data/v8.2/new_riskprofiles?$select=new_q1,new_q2,new_q3,new_q4,new_q5,new_q6&$filter=new_riskprofileid eq " + RiskID);
    var jsonres = JSON.parse(sourceRiskprofile);
    //catch the source Data to clone it to the new account
    if (sourceRiskprofile != undefined && jsonres.value.length > 0) {
        var q1 = jsonres.value[0].new_q1;
        var q2 = jsonres.value[0].new_q2;
        var q3 = jsonres.value[0].new_q3;
        var q4 = jsonres.value[0].new_q4;
        var q5 = jsonres.value[0].new_q5;
        var q6 = jsonres.value[0].new_q6;

        var ExistRiskprofile = ODataRequestJSONParsed("/api/data/v8.2/new_riskprofiles?$select=new_riskprofileid&$filter=_new_accountid_value eq " + targetAccountID);
        var json = JSON.parse(ExistRiskprofile);

        if (ExistRiskprofile != undefined && json.value.length > 0) {

            XrmSvcToolkit.updateRecord({
                entityName: "new_riskprofile",
                id: json.value[0].new_riskprofileid,
                entity:
                    {
                        new_Q1: q1,
                        new_Q2: q2,
                        new_Q3: q3,
                        new_Q4: q4,
                        new_Q5: q5,
                        new_Q6: q6
                    },
                async: false,
                errorCallback: function (error) {
                    errorOcured("There was an error when updating the risk profile record");
                }
            });
            alert('Risk Profile Updated OK!');
        }
        else {

            var Riskprofile = XrmSvcToolkit.createRecord({
                entityName: "new_riskprofile",
                entity: {
                    new_Q1: q1,
                    new_Q2: q2,
                    new_Q3: q3,
                    new_Q4: q4,
                    new_Q5: q5,
                    new_Q6: q6,
                    new_AccountId: { Id: targetAccountID, LogicalName: "account" },
                },
                async: false,
                errorCallback: function (error) {
                    errorOcured("There was an error when creating the authentication trace record");
                }
            });

            if (Riskprofile.new_riskprofileId != null) {
                alert('Submit OK!');
            }
            else {
                alert('Error in Submit, please contact Administrator!');
            }

        }

        window.close();

    }
});
