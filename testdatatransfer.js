const soapRequest = require("easy-soap-request");

const utils = require("./utils");
const parser = require('fast-xml-parser');
const moment = require("moment");
const he = require('he');
const uuid = require("uuid");

const options = {
    attributeNamePrefix: "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName: "#text",
    ignoreAttributes: true,
    ignoreNameSpace: true,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false,
    arrayMode: false,
    attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),
    tagValueProcessor: (val, tagName) => he.decode(val),
    stopNodes: ["parse-me-as-string"]
};

const url = "http://172.25.38.43:2222";

const headers = {
    'User-Agent': 'NodeApp',
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': 'http://172.25.39.13/wsdls/Surfline/CustomRecharge/CustomRecharge',
    'Authorization': 'Basic YWlhb3NkMDE6YWlhb3NkMDE='
};


(async () => {
    try {


        let isDebitSuccess = false;
        let isCreditSuccess = false;


        let to_msisdn = "233255000103";
        let from_msisdn = "233255000102";
        let txn_id = uuid.v4();
        let user = "EGH00047";
        let amount = "1000";

        let from_balanceType = "3GBSurfplus Data";
        let to_balanceType = "1.5GBSurfplus Data";

        let validity = 30;
        let period = 0;




            const debitXML = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:dat="http://SCLINSMSVM01T/wsdls/Surfline/DataTransferManual.wsdl">
   <soapenv:Header/>
   <soapenv:Body>
      <dat:DataTransferManualRequest>
         <CC_Calling_Party_Id>${from_msisdn}</CC_Calling_Party_Id>
         <Recharge_List_List>
            <Recharge_List>
               <Balance_Type_Name>${from_balanceType}</Balance_Type_Name>
               <Recharge_Amount>-${amount}</Recharge_Amount>
               <Balance_Expiry_Extension_Period></Balance_Expiry_Extension_Period>
               <Balance_Expiry_Extension_Policy></Balance_Expiry_Extension_Policy>
               <Bucket_Creation_Policy></Bucket_Creation_Policy>
               <Balance_Expiry_Extension_Type></Balance_Expiry_Extension_Type>
            </Recharge_List>
         </Recharge_List_List>
         <CHANNEL>IN_Web</CHANNEL>
         <TRANSACTION_ID>${txn_id}</TRANSACTION_ID>
         <POS_USER>${user}</POS_USER>
      </dat:DataTransferManualRequest>
   </soapenv:Body>
</soapenv:Envelope>`;


            const {response} = await soapRequest({
                url: url,
                headers: headers,
                xml: debitXML,
                timeout: 4000
            });
            const {body} = response;
            let jsonObj = parser.parse(body, options);
            const soapResponseBody = jsonObj.Envelope.Body;
            console.log(soapResponseBody)
            if (!soapResponseBody.DataTransferManualResult) {
                isDebitSuccess = true;
                console.log("debit success")
            } else {
                let soapFault = jsonObj.Envelope.Body.Fault;
                let faultString = soapFault.faultstring;
                console.log(faultString);
            }

            if (isDebitSuccess) {
                const creditXML = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:dat="http://SCLINSMSVM01T/wsdls/Surfline/DataTransferManual.wsdl">
   <soapenv:Header/>
   <soapenv:Body>
      <dat:DataTransferManualRequest>
         <CC_Calling_Party_Id>${to_msisdn}</CC_Calling_Party_Id>
         <Recharge_List_List>
            <Recharge_List>
               <Balance_Type_Name>${to_balanceType}</Balance_Type_Name>
               <Recharge_Amount>${amount}</Recharge_Amount>
               <Balance_Expiry_Extension_Period>${validity}</Balance_Expiry_Extension_Period>
               <Balance_Expiry_Extension_Policy></Balance_Expiry_Extension_Policy>
               <Bucket_Creation_Policy></Bucket_Creation_Policy>
               <Balance_Expiry_Extension_Type>${period}</Balance_Expiry_Extension_Type>
            </Recharge_List>
         </Recharge_List_List>
         <CHANNEL>IN_Web</CHANNEL>
         <TRANSACTION_ID>${txn_id}</TRANSACTION_ID>
         <POS_USER>${user}</POS_USER>
      </dat:DataTransferManualRequest>
   </soapenv:Body>
</soapenv:Envelope>`;
                const {response} = await soapRequest({
                    url: url,
                    headers: headers,
                    xml: creditXML,
                    timeout: 4000
                });
                const {body} = response;
                let jsonObj = parser.parse(body, options);
                const soapResponseBody = jsonObj.Envelope.Body;
                if (!soapResponseBody.DataTransferManualResult) {
                    console.log("Successful")
                } else {
                    let soapFault = jsonObj.Envelope.Body.Fault;
                    let faultString = soapFault.faultstring;
                    console.log(faultString);
                }


            }else {
                console.log("Error occurred during the debit")
            }





    } catch (error) {
        let errorBody = error.toString();
        console.log(errorBody)
        let jsonObj = parser.parse(errorBody, options);
        let soapFault = jsonObj.Envelope.Body.Fault;
        let faultString = soapFault.faultstring;
        console.log(faultString)


    }

})()
