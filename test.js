const soapRequest = require("easy-soap-request");
const xml2js = require("xml2js");
const url = "http://172.25.38.43:2222";
const sampleHeaders = {
    'User-Agent': 'NodeApp',
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': 'http://SCLINSMSVM01P/wsdls/Surfline/VoucherRecharge_USSD/VoucherRecharge_USSD',
    'Authorization': 'Basic cGM6cGMxMjM='
};


let msisdn = "233255000103";
let voucher_pin = "90166345314311";


let xmlvoucher = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:vouc="http://SCLINSMSVM01P/wsdls/Surfline/VoucherRecharge.wsdl">
   <soapenv:Header/>
   <soapenv:Body>
      <vouc:VoucherRechargeRequest>
         <CC_Calling_Party_Id>${msisdn}</CC_Calling_Party_Id>
         <CHANNEL>IN_Web_Portal</CHANNEL>
         <TRANSACTION_ID>123445</TRANSACTION_ID>
         <WALLET_TYPE>Primary</WALLET_TYPE>
         <VoucherNumber>${voucher_pin}</VoucherNumber>
         <ScenarioID>1</ScenarioID>
      </vouc:VoucherRechargeRequest>
   </soapenv:Body>
</soapenv:Envelope>
`;


(async () => {
    console.time();
    try {
        const {response} = await soapRequest({url: url, headers: sampleHeaders, xml: xmlvoucher, timeout: 3000}); // Optional timeout parameter(milliseconds)

        const {headers, body, statusCode} = response;

        if (body.includes("VoucherRechargeResult")){
            console.log("success");
            console.timeEnd()
        }


    } catch (e) {
        let body = e.toString();
        if (body.includes("faultcode")) {
            const errorInfo = {};
            let regex = /errorCode>(.+)<\//
            let match = regex.exec(body);
            console.log(match[1])

            console.timeEnd();
        }

    }

})();
