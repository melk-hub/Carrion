"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationStatus = void 0;
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["APPLIED"] = "APPLIED";
    ApplicationStatus["PENDING"] = "PENDING";
    ApplicationStatus["INTERVIEW_SCHEDULED"] = "INTERVIEW_SCHEDULED";
    ApplicationStatus["TECHNICAL_TEST"] = "TECHNICAL_TEST";
    ApplicationStatus["OFFER_RECEIVED"] = "OFFER_RECEIVED";
    ApplicationStatus["NEGOTIATION"] = "NEGOTIATION";
    ApplicationStatus["OFFER_ACCEPTED"] = "OFFER_ACCEPTED";
    ApplicationStatus["REJECTED_BY_COMPANY"] = "REJECTED_BY_COMPANY";
    ApplicationStatus["OFFER_DECLINED"] = "OFFER_DECLINED";
    ApplicationStatus["APPLICATION_WITHDRAWN"] = "APPLICATION_WITHDRAWN";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
