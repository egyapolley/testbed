const moment = require("moment")
function getBundleName(bundleId) {
    if (bundleId === "21" || bundleId === "General Cash") return "General Cash";
    else if (bundleId ==="29" || bundleId ==="Data") return "Data";
    else if (bundleId ==="30" || bundleId ==="Promotional Data") return "Promomotional Data";
    else if (bundleId ==="61" || bundleId ==="Gift Data") return "Gift Data";
    else if (bundleId ==="107" || bundleId ==="FDFL Data") return "FDFL Data";
    else if (bundleId ==="108" || bundleId ==="Tablet Data") return "Tablet Data";
    else if (bundleId ==="163" || bundleId ==="ULNitePlan Status") return "Unlimited Night Status";
    else if (bundleId ==="182" || bundleId ==="Staff Data") return "Staff Data";
    else if (bundleId ==="222" || bundleId ==="Bonus Data") return "Bonus Data";
    else if (bundleId ==="303" || bundleId ==="ULDayNitePlan Data") return "Unlimited Day/Night Data";
    else if (bundleId ==="304" || bundleId ==="ULDayNitePlan Status") return "Unlimited Day/Night Status";
    else if (bundleId ==="342" || bundleId ==="Videobundle Data") return "Video Package Data";
    else if (bundleId ==="462" || bundleId ==="ULBusiness2 Data") return "Unlimited Business Data";
    else if (bundleId ==="463" || bundleId ==="ULBusiness2 Status") return "Unlimited Business Status";
    else if (bundleId ==="662" || bundleId ==="Complimentary Data") return "Complementary Data";
    else if (bundleId ==="682" || bundleId ==="ULVideo Data") return "Unlimited Video";
    else if (bundleId ==="683" || bundleId ==="ULVideo Status") return "Unlimited Video Status";
    else if (bundleId ==="742" || bundleId ==="Ten4Ten Data") return "Ten4Ten Data";
    else if (bundleId ==="802" || bundleId ==="FreeTime Data") return "FreeTime Bonus Data";
    else if (bundleId ==="862" || bundleId ==="1GBSurfplus Data") return "1GB Surfplus Data";
    else if (bundleId ==="863" || bundleId ==="1.5GBSurfplus Data") return "1.5GB Surfplus Data";
    else if (bundleId ==="864" || bundleId ==="6GBSurfplus Data") return "6GB Surfplus Data";
    else if (bundleId ==="865" || bundleId ==="2GBSurfplus Data") return "2GB Surfplus Data";
    else if (bundleId ==="866" || bundleId ==="3GBSurfplus Data") return "3GB Surfplus Data";
    else if (bundleId ==="867" || bundleId ==="4.5GBSurfplus Data") return "4.5GB Surfplus Data";
    else if (bundleId ==="868" || bundleId ==="8GBSurfplus Data") return "8GB Surfplus Data";
    else if (bundleId ==="869" || bundleId ==="15GBSurfplus Data") return "15GB Surfplus Data";
    else if (bundleId ==="870" || bundleId ==="30GBSurfplus Data") return "30GB Surfplus Data,";
    else if (bundleId ==="871" || bundleId ==="45GBSurfplus Data") return "45GB Surfplus Data";
    else if (bundleId ==="872"|| bundleId ==="75GBSurfplus Data") return "75GBS urfplus Data";
    else if (bundleId ==="873"|| bundleId ==="100GBSurfplus Data") return "100GB Surfplus Data";
    else if (bundleId ==="876"|| bundleId ==="Free Saturday Data") return "Free Saturday Data";
    else if (bundleId ==="942"|| bundleId ==="Taxify Data") return "Taxify Data";
    else if (bundleId ==="983"|| bundleId ==="ExtraTime Bonus Bonus") return "ExtraTime Bonus Data";
    else if (bundleId ==="1002"|| bundleId ==="Anniversary Data") return "Anniversary Data";
    else if (bundleId ==="1004"|| bundleId ==="UL_AlwaysON_Standard Status") return "AlwaysON_Standard Status";
    else if (bundleId ==="1005"|| bundleId ==="UL_AlwaysON_Standard Data") return "AlwaysON_Standard Data";
    else if (bundleId ==="1006"|| bundleId ==="UL_AlwaysON_Super Status") return "AlwaysON_Super Status";
    else if (bundleId ==="1007"|| bundleId ==="UL_AlwaysON_Super Data") return "AlwaysON_Super Data";
    else if (bundleId ==="1008"|| bundleId ==="UL_AlwaysON_Ultra Status") return "AlwaysON_Ultra Status";
    else if (bundleId ==="1009"|| bundleId ==="UL_AlwaysON_Ultra Data") return "AlwaysON_Ultra Data";
    else if (bundleId ==="1042"|| bundleId ==="UL_AlwaysON_Starter Data") return "AlwaysON_Starter Data";
    else if (bundleId ==="1043"|| bundleId ==="UL_AlwaysON_Starter Status") return "AlwaysON_Starter Status";
    else if (bundleId ==="1044"|| bundleId ==="UL_AlwaysON_Lite Data") return "AlwaysON_Lite Data";
    else if (bundleId ==="1045"|| bundleId ==="UL_AlwaysON_Lite Status") return "AlwaysON_Lite Status";
    else if (bundleId ==="1046"|| bundleId ==="UL_AlwaysON_Streamer Data") return "AlwaysON_Streamer Data";
    else if (bundleId ==="1047"|| bundleId ==="UL_AlwaysON_Streamer Status") return "AlwaysON_Streamer Status";
    else if (bundleId ==="1082"|| bundleId ==="Staff_AlwaysON_1GB Data") return "Staff_AlwaysON_1GB Data";
    else if (bundleId ==="1083"|| bundleId ==="Staff_AlwaysON_1GB Count") return "Staff_AlwaysON_1GB Count";
    else if (bundleId ==="1084"|| bundleId ==="Staff_AlwaysON_2GB Data") return "Staff_AlwaysON_2GB Data";
    else if (bundleId ==="1085"|| bundleId ==="Staff_AlwaysON_2GB Count") return "Staff_AlwaysON_2GB Count";
    else if (bundleId ==="1086"|| bundleId ==="Staff_AlwaysON_5GB Data") return "Staff_AlwaysON_5GB Data";
    else if (bundleId ==="1087"|| bundleId ==="Staff_AlwaysON_5GB Count") return "Staff_AlwaysON_5GB Count";
    else if (bundleId ==="1088"|| bundleId ==="Staff_AlwaysON_10GB Data") return "Staff_AlwaysON_10GB Data";
    else if (bundleId ==="1089"|| bundleId ==="Staff_AlwaysON_10GB Count") return "Staff_AlwaysON_10GB Count";
    else if (bundleId ==="1090"|| bundleId ==="Staff_AlwaysON_3GB Count") return "Staff_AlwaysON_3GB Count";
    else if (bundleId ==="1091"|| bundleId ==="Staff_AlwaysON_3GB Data") return "Staff_AlwaysON_3GB Data";
    else if (bundleId ==="101"|| bundleId ==="Autorecovery") return "Autorecovery";
    else if (bundleId ==="1102"|| bundleId ==="Bundle ExpiryTrack Status") return "Bundle Expiry Tracker";
    else if (bundleId ==="32" || bundleId === "CTAllowLastDate") return "CTAllowLastDate";



}

function getDateFormat(date){
    return moment(date,"YYYYMMDDhhmmss").format("YYYY-MM-DD hh:mm:ss")
}

exports.getBundleName = getBundleName;

exports.getDateFormat = getDateFormat;
