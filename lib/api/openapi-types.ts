// This file is generated from https://api.knock-in.com/v3/api-docs.
// Run `node scripts/generate-openapi-types.js` to refresh it.

export interface OpenApiComponents {
  schemas: {
    "org.example.knockin.dto.ModifyProfileRoomInfoDto$Request": {
        "type"?: "SEEKER" | "OFFER";
        "minDeposit"?: number;
        "maxDeposit"?: number;
        "minMounthRent"?: number;
        "maxMounthRent"?: number;
        "comeEnableAt"?: string;
        "region"?: number[];
        "roomProfile"?: number[];
        "deposit"?: number;
        "mounthRent"?: number;
        "comeableAtNegotiable"?: boolean;
      };
    "org.example.knockin.dto.ModifyProfileRoomInfoDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyProfileRoomInfoDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ModifyProfileRoomInfoDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.global.api.ErrorResponse": {
        "codeNo"?: number;
        "code"?: string;
        "message"?: string;
      };
    "org.example.knockin.dto.ModifyProfileLifeStyleDto$Request": {
        "lifestyles"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ModifyProfileLifeStyleDto$Request$LifeStyleInfo"][];
      };
    "org.example.knockin.dto.ModifyProfileLifeStyleDto$Request$LifeStyleInfo": {
        "id"?: number;
        "lifestyleId"?: number;
      };
    "org.example.knockin.dto.ModifyProfileLifeStyleDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyProfileLifeStyleDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ModifyProfileLifeStyleDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.ModifyProfileBasicDto$Request": {
        "name"?: string;
        "birth"?: string;
        "gender"?: "MALE" | "FEMALE";
        "email"?: string;
        "terms"?: number[];
      };
    "org.example.knockin.dto.ModifyProfileBasicDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyProfileBasicDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ModifyProfileBasicDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.ModifyProfileAllDto$Request": {
        "name"?: string;
        "birth"?: string;
        "gender"?: "MALE" | "FEMALE";
        "email"?: string;
        "terms"?: number[];
        "lifestyles"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ModifyProfileAllDto$Request$LifeStyleInfo"][];
        "type"?: "SEEKER" | "OFFER";
        "minDeposit"?: number;
        "maxDeposit"?: number;
        "minMounthRent"?: number;
        "maxMounthRent"?: number;
        "comeEnableAt"?: string;
        "region"?: number[];
        "roomProfile"?: number[];
        "deposit"?: number;
        "mounthRent"?: number;
        "comeableAtNegotiable"?: boolean;
      };
    "org.example.knockin.dto.ModifyProfileAllDto$Request$LifeStyleInfo": {
        "id"?: number;
        "lifestyleId"?: number;
      };
    "org.example.knockin.dto.ModifyProfileAllDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyProfileAllDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ModifyProfileAllDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.ModifyPreferencesLifeStyleDto$Request": {
        "lifestyles"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ModifyPreferencesLifeStyleDto$Request$LifeStyleInfo"][];
      };
    "org.example.knockin.dto.ModifyPreferencesLifeStyleDto$Request$LifeStyleInfo": {
        "id"?: number;
        "lifestyleId"?: number;
      };
    "org.example.knockin.dto.ModifyPreferencesLifeStyleDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyPreferencesLifeStyleDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ModifyPreferencesLifeStyleDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.ModifyPreferencesConditionsDto$Request": {
        "conditions"?: number[];
      };
    "org.example.knockin.dto.ModifyPreferencesConditionsDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyPreferencesConditionsDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ModifyPreferencesConditionsDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.ModifyPreferencesAllDto$Request": {
        "lifestyles"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ModifyPreferencesLifeStyleDto$Request$LifeStyleInfo"][];
        "conditions"?: number[];
      };
    "org.example.knockin.dto.ModifyPreferencesAllDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyPreferencesAllDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ModifyPreferencesAllDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.CalendarDto$Request": {
        "roommateId"?: number;
        "title"?: string;
        "contents"?: string;
        "startDt"?: string;
        "endDt"?: string;
      };
    "org.example.knockin.dto.CalendarDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.CalendarDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.CalendarDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoardModifyDto$Request": {
        "title": string;
        "deposit": number;
        "monthlyRent": number;
        "managementCost": number;
        "roomTypeId": number;
        "regionId": number;
        "comeableDateNegotiable"?: boolean;
        "comeableDate"?: string;
        "deleteExtraOptionIds"?: number[];
        "newExtraOptionIds"?: number[];
        "contents": string;
        "existingImages"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardModifyDto$Request$ExistingFileDto"][];
        "newImages"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardModifyDto$Request$NewFileDto"][];
      };
    "org.example.knockin.dto.BoardModifyDto$Request$ExistingFileDto": {
        "boardFileId": number;
        "thumbnail"?: boolean;
      };
    "org.example.knockin.dto.BoardModifyDto$Request$NewFileDto": {
        "fileIndex": number;
        "thumbnail"?: boolean;
      };
    "org.example.knockin.dto.BoardModifyDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoardModifyDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardModifyDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoTypeTermsDto$Request": {
        "title"?: string;
      };
    "org.example.knockin.dto.BoTypeTermsDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoTypeTermsDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoTypeTermsDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoTermsDto$Request": {
        "agreementTypeId"?: number;
        "title"?: string;
        "contents"?: string;
        "isRequired"?: boolean;
      };
    "org.example.knockin.dto.BoTermsDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoTermsDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoTermsDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoRoomTypeDto$Request": {
        "name"?: string;
      };
    "org.example.knockin.dto.BoRoomTypeDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoRoomTypeDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoRoomTypeDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoNoticeDto$Request": {
        "title"?: string;
        "contents"?: string;
      };
    "org.example.knockin.dto.BoNoticeDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoNoticeDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoNoticeDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoLifeStylePatternDto$Request": {
        "name"?: string;
        "type"?: "SCALE" | "BOOLEAN" | "SINGLE_CHOICE";
        "sort"?: number;
        "details"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoLifeStylePatternDto$Request$DetailItem"][];
      };
    "org.example.knockin.dto.BoLifeStylePatternDto$Request$DetailItem": {
        "values"?: string;
        "description"?: string;
      };
    "org.example.knockin.dto.BoLifeStylePatternDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoLifeStylePatternDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoLifeStylePatternDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.FaqModifyDto$Request": {
        "id"?: number;
        "title"?: string;
        "contents"?: string;
        "sort"?: number;
      };
    "org.example.knockin.dto.FaqModifyDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.FaqModifyDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.FaqModifyDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.AuthEmailModifyDto$Request": {
        "id"?: number;
        "domain"?: string;
        "name"?: string;
        "type"?: "STUDENT" | "COMPANY";
      };
    "org.example.knockin.dto.AuthEmailModifyDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.AuthEmailModifyDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.AuthEmailModifyDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.AppVersionModifyDto$Request": {
        "id"?: number;
        "version"?: string;
      };
    "org.example.knockin.dto.AppVersionModifyDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.AppVersionModifyDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.AppVersionModifyDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.SaveProfileRoomInfoDto$Request": {
        "type"?: "SEEKER" | "OFFER";
        "minDeposit"?: number;
        "maxDeposit"?: number;
        "minMounthRent"?: number;
        "maxMounthRent"?: number;
        "comeEnableAt"?: string;
        "region"?: number[];
        "roomProfile"?: number[];
        "deposit"?: number;
        "mounthRent"?: number;
        "comeableAtNegotiable"?: boolean;
      };
    "org.example.knockin.dto.SaveProfileRoomInfoDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SaveProfileRoomInfoDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.SaveProfileRoomInfoDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.SaveProfileLifeStyleDto$Request": {
        "lifestyles"?: number[];
      };
    "org.example.knockin.dto.SaveProfileLifeStyleDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SaveProfileLifeStyleDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.SaveProfileLifeStyleDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.SaveProfileBasicDto$Request": {
        "name"?: string;
        "birth"?: string;
        "gender"?: "MALE" | "FEMALE";
        "email"?: string;
        "terms"?: number[];
      };
    "org.example.knockin.dto.SaveProfileBasicDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SaveProfileBasicDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.SaveProfileBasicDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.SaveProfileAllDto$Request": {
        "name"?: string;
        "birth"?: string;
        "gender"?: "MALE" | "FEMALE";
        "email"?: string;
        "terms"?: number[];
        "lifestyles"?: number[];
        "type"?: "SEEKER" | "OFFER";
        "minDeposit"?: number;
        "maxDeposit"?: number;
        "minMounthRent"?: number;
        "maxMounthRent"?: number;
        "comeEnableAt"?: string;
        "region"?: number[];
        "roomProfile"?: number[];
        "deposit"?: number;
        "mounthRent"?: number;
        "comeableAtNegotiable"?: boolean;
      };
    "org.example.knockin.dto.SaveProfileAllDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SaveProfileAllDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.SaveProfileAllDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.SavePreferencesLifeStyleDto$Request": {
        "lifestyles"?: number[];
      };
    "org.example.knockin.dto.SavePreferencesLifeStyleDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SavePreferencesLifeStyleDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.SavePreferencesLifeStyleDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.SavePreferencesConditionsDto$Request": {
        "conditions"?: number[];
      };
    "org.example.knockin.dto.SavePreferencesConditionsDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SavePreferencesConditionsDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.SavePreferencesConditionsDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.SavePreferencesAllDto$Request": {
        "lifestyles"?: number[];
        "conditions"?: number[];
      };
    "org.example.knockin.dto.SavePreferencesAllDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SavePreferencesAllDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.SavePreferencesAllDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.MemberReportDto$Request": {
        "contents": string;
      };
    "org.example.knockin.dto.MemberReportDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MemberReportDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MemberReportDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.MatchDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MatchDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchDto$Response"];
        "status"?: number;
      };
    "BoardFileRequest": {
        "fileIndex": number;
        "thumbnail"?: boolean;
      };
    "BoardSaveRequest": {
        "title": string;
        "contents": string;
        "deposit": number;
        "mountlyRent": number;
        "managementCost": number;
        "roomTypeId": number;
        "regionId": number;
        "comeableDateNegotiable"?: boolean;
        "comeableDate"?: string;
        "images"?: OpenApiComponents["schemas"]["BoardFileRequest"][];
      };
    "BoardSaveResponse": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseBoardSaveResponse": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["BoardSaveResponse"];
        "status"?: number;
      };
    "org.example.knockin.dto.ReportDto$Request": {
        "contents": string;
      };
    "org.example.knockin.dto.ReportDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ReportDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ReportDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.RoommateRequestDto$Request": {
        "chatRoomId"?: number;
      };
    "org.example.knockin.dto.RoommateRequestDto$Response": {
        "roommateMatchingRequiredInfo"?: OpenApiComponents["schemas"]["org.example.knockin.dto.RoommateRequestDto$RoommateMatchingRequiredInfo"];
      };
    "org.example.knockin.dto.RoommateRequestDto$RoommateMatchingRequiredInfo": {
        "id"?: number;
        "requesterMemberId"?: number;
        "requesteeMemberId"?: number;
        "status"?: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED" | "EXPIRED";
        "createdAt"?: string;
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.RoommateRequestDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.RoommateRequestDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.InquiryDto$Request": {
        "categoryId"?: number;
        "title"?: string;
        "contents"?: string;
      };
    "org.example.knockin.dto.InquiryDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.InquiryDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.InquiryDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.ChatRoomCreateDto$ChatMessage": {
        "contents": string;
      };
    "org.example.knockin.dto.ChatRoomCreateDto$Request": {
        "requesteeId": number;
        "boardId"?: number;
        "chatMessage": OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRoomCreateDto$ChatMessage"];
      };
    "org.example.knockin.dto.ChatRoomCreateDto$Response": {
        "chatRoomId"?: number;
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ChatRoomCreateDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRoomCreateDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.ChatRoomDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ChatRoomDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRoomDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.ChatRoomImageDto$Response": {
        "imageUrl"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ChatRoomImageDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRoomImageDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.ChatRequestDto$Request": {
        "requesteeId": number;
        "boardId"?: number;
      };
    "org.example.knockin.dto.ChatRequestDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ChatRequestDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRequestDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoReportSuspendedDto$Request": {
        "id"?: number;
        "type"?: "MEMBER" | "BOARD";
        "reason"?: string;
      };
    "org.example.knockin.dto.BoReportSuspendedDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoReportSuspendedDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoReportSuspendedDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoReportNoActionDto$Request": {
        "id"?: number;
        "type"?: "MEMBER" | "BOARD";
      };
    "org.example.knockin.dto.BoReportNoActionDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoReportNoActionDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoReportNoActionDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoReportHiddenDto$Request": {
        "id"?: number;
        "type"?: "MEMBER" | "BOARD";
        "reason"?: string;
      };
    "org.example.knockin.dto.BoReportHiddenDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoReportHiddenDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoReportHiddenDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoInquiryReplyDto$Request": {
        "inquirieId"?: number;
        "contents"?: string;
      };
    "org.example.knockin.dto.BoInquiryReplyDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoInquiryReplyDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoInquiryReplyDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.FaqSaveDto$Request": {
        "title"?: string;
        "contents"?: string;
        "sort"?: number;
      };
    "org.example.knockin.dto.FaqSaveDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.FaqSaveDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.FaqSaveDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.AuthEmailSaveDto$Request": {
        "domain"?: string;
        "name"?: string;
        "type"?: "STUDENT" | "COMPANY";
      };
    "org.example.knockin.dto.AuthEmailSaveDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.AuthEmailSaveDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.AuthEmailSaveDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.AppVersionSaveDto$Request": {
        "version"?: string;
      };
    "org.example.knockin.dto.AppVersionSaveDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.AppVersionSaveDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.AppVersionSaveDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BlockDto$Request": {
        "userId"?: number;
      };
    "org.example.knockin.dto.BlockDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BlockDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BlockDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.global.api.CommonResponseJava.lang.Object": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: Record<string, never>;
        "status"?: number;
      };
    "org.example.knockin.dto.EmailSendDto$Request": {
        "email"?: string;
      };
    "org.example.knockin.dto.EmailSendDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.EmailSendDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.EmailSendDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.EmailConfirmDto$Request": {
        "email"?: string;
        "authNo"?: string;
      };
    "org.example.knockin.dto.EmailConfirmDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.EmailConfirmDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.EmailConfirmDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.ProfileVisibilityDto$Request": {
        "status"?: "PUBLIC" | "PRIVATE";
      };
    "org.example.knockin.dto.ProfileVisibilityDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ProfileVisibilityDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ProfileVisibilityDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.AlarmSettingDto$Request": {
        "settingId"?: number;
        "enabled"?: boolean;
      };
    "org.example.knockin.dto.AlarmSettingDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.AlarmSettingDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.AlarmSettingDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoVerificationDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoVerificationDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoVerificationDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoMemberCancelDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoMemberCancelDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoMemberCancelDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoMemberAuthDto$Request": {
        "memberRole"?: "USER" | "ADMIN";
      };
    "org.example.knockin.dto.BoMemberAuthDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoMemberAuthDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoMemberAuthDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.AlarmReadDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.AlarmReadDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.AlarmReadDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.AlarmReadAllDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.AlarmReadAllDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.AlarmReadAllDto$Response"];
        "status"?: number;
      };
    "org.springdoc.core.converters.models.Pageable": {
        "page"?: number;
        "size"?: number;
        "sort"?: string[];
      };
    "org.example.knockin.dto.MyVerificationListDto$Response": {
        "studentAuth"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyVerificationListDto$Response$AuthInfo"];
        "employeeAuth"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyVerificationListDto$Response$AuthInfo"];
      };
    "org.example.knockin.dto.MyVerificationListDto$Response$AuthInfo": {
        "isAccepted"?: boolean;
        "email"?: string;
        "createAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyVerificationListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyVerificationListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.MyProfileAllDto$Response": {
        "lifestyles"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyProfileAllDto$Response$Lifestyle"][];
        "type"?: "SEEKER" | "OFFER";
        "minDeposit"?: number;
        "maxDeposit"?: number;
        "minMounthRent"?: number;
        "maxMounthRent"?: number;
        "comeEnableAt"?: string;
        "region"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyProfileAllDto$Response$Region"][];
        "roomProfile"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyProfileAllDto$Response$RoomProfile"][];
        "deposit"?: number;
        "mounthRent"?: number;
      };
    "org.example.knockin.dto.MyProfileAllDto$Response$Lifestyle": {
        "id"?: number;
        "lifestyleId"?: number;
        "name"?: string;
        "value"?: string;
        "description"?: string;
        "type"?: "SCALE" | "BOOLEAN" | "SINGLE_CHOICE";
      };
    "org.example.knockin.dto.MyProfileAllDto$Response$Region": {
        "regionId"?: number;
        "region"?: string;
      };
    "org.example.knockin.dto.MyProfileAllDto$Response$RoomProfile": {
        "roomProfileId"?: number;
        "roomProfileName"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyProfileAllDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyProfileAllDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.MyPreferencesAllDto$Response": {
        "lifestyles"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyPreferencesAllDto$Response$Lifestyle"][];
        "conditions"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyPreferencesAllDto$Response$Condition"][];
      };
    "org.example.knockin.dto.MyPreferencesAllDto$Response$Condition": {
        "conditionsId"?: number;
        "name"?: string;
      };
    "org.example.knockin.dto.MyPreferencesAllDto$Response$Lifestyle": {
        "id"?: number;
        "lifestyleId"?: number;
        "name"?: string;
        "value"?: string;
        "description"?: string;
        "type"?: "SCALE" | "BOOLEAN" | "SINGLE_CHOICE";
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyPreferencesAllDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyPreferencesAllDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.MyNotificationSettingsDto$Response": {
        "alarmsSettings"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyNotificationSettingsDto$Response$AlarmSettingItem"][];
      };
    "org.example.knockin.dto.MyNotificationSettingsDto$Response$AlarmSettingItem": {
        "id"?: number;
        "name"?: string;
        "isEnable"?: boolean;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyNotificationSettingsDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyNotificationSettingsDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.MyBoardListDto$Response": {
        "boards"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyBoardListDto$Response$BoardItem"][];
      };
    "org.example.knockin.dto.MyBoardListDto$Response$BoardItem": {
        "boardId"?: number;
        "image"?: string;
        "title"?: string;
        "deposit"?: number;
        "monthlyRent"?: number;
        "region"?: string;
        "createdAt"?: string;
        "memberName"?: string;
        "roomTypes"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyBoardListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyBoardListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.TermsListDto$Response": {
        "terms"?: OpenApiComponents["schemas"]["org.example.knockin.dto.TermsListDto$Response$TermsItem"][];
      };
    "org.example.knockin.dto.TermsListDto$Response$TermsItem": {
        "id"?: number;
        "title"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.TermsListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.TermsListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.TermsDetailDto$Response": {
        "id"?: number;
        "contents"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.TermsDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.TermsDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.PopularSearchDto$Response": {
        "rank"?: OpenApiComponents["schemas"]["org.example.knockin.dto.PopularSearchDto$Response$RankItem"][];
      };
    "org.example.knockin.dto.PopularSearchDto$Response$RankItem": {
        "id"?: number;
        "keyword"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.PopularSearchDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.PopularSearchDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.MyRoommateDto$Response": {
        "userId"?: number;
        "userName"?: string;
        "compatibility"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyRoommateDto$Response$Compatibility"];
        "preferences"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyRoommateDto$Response$Lifestyle"][];
      };
    "org.example.knockin.dto.MyRoommateDto$Response$Compatibility": {
        "score"?: number;
        "lifeStyleInfo"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyRoommateDto$Response$LifeStyleInfo"][];
      };
    "org.example.knockin.dto.MyRoommateDto$Response$LifeStyleInfo": {
        "title"?: string;
        "percent"?: string;
      };
    "org.example.knockin.dto.MyRoommateDto$Response$Lifestyle": {
        "lifestyleId"?: number;
        "name"?: string;
        "value"?: string;
        "description"?: string;
        "type"?: "SCALE" | "BOOLEAN" | "SINGLE_CHOICE";
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyRoommateDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyRoommateDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.MyRoommateCalendarListDto$Response": {
        "calendars"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyRoommateCalendarListDto$Response$Calendar"][];
      };
    "org.example.knockin.dto.MyRoommateCalendarListDto$Response$Calendar": {
        "calendarId"?: number;
        "writer"?: string;
        "startDt"?: string;
        "endDt"?: string;
        "createAt"?: string;
        "type"?: string;
        "title"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyRoommateCalendarListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyRoommateCalendarListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.MyRoommateCalendarDetailDto$Response": {
        "id"?: number;
        "title"?: string;
        "contents"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyRoommateCalendarDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MyRoommateCalendarDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.CalendarTypesDto$Response": {
        "types"?: OpenApiComponents["schemas"]["org.example.knockin.dto.CalendarTypesDto$Response$Type"][];
      };
    "org.example.knockin.dto.CalendarTypesDto$Response$Type": {
        "id"?: number;
        "name"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.CalendarTypesDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.CalendarTypesDto$Response"];
        "status"?: number;
      };
    "Pageablenull": {
        "paged"?: boolean;
        "pageSize"?: number;
        "pageNumber"?: number;
        "unpaged"?: boolean;
        "offset"?: number;
        "sort"?: OpenApiComponents["schemas"]["Sortnull"];
      };
    "Sortnull": {
        "sorted"?: boolean;
        "unsorted"?: boolean;
        "empty"?: boolean;
      };
    "org.example.knockin.dto.MatchListDto$Condition": {
        "conditionId"?: number;
        "name"?: string;
        "value"?: string;
        "description"?: string;
        "type"?: "SCALE" | "BOOLEAN" | "SINGLE_CHOICE";
      };
    "org.example.knockin.dto.MatchListDto$ConditionWeight": {
        "conditionWeightId"?: number;
        "name"?: string;
      };
    "org.example.knockin.dto.MatchListDto$Lifestyle": {
        "lifestyleId"?: number;
        "name"?: string;
        "value"?: string;
        "description"?: string;
        "type"?: "SCALE" | "BOOLEAN" | "SINGLE_CHOICE";
      };
    "org.example.knockin.dto.MatchListDto$OfferProfile": {
        "deposit"?: number;
        "monthlyRent"?: number;
        "regionFullName"?: string;
        "roomTypeName"?: string;
      };
    "org.example.knockin.dto.MatchListDto$Response": {
        "memberId"?: number;
        "memberProfileImageUrl"?: string;
        "memberName"?: string;
        "memberAge"?: number;
        "gender"?: "MALE" | "FEMALE";
        "isLike"?: boolean;
        "roomProfileType"?: "SEEKER" | "OFFER";
        "seekerProfile"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchListDto$SeekerProfile"];
        "offerProfile"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchListDto$OfferProfile"];
        "score"?: number;
        "lifeStyles"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchListDto$Lifestyle"][];
        "conditions"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchListDto$Condition"][];
        "conditionWeights"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchListDto$ConditionWeight"][];
      };
    "org.example.knockin.dto.MatchListDto$SeekerProfile": {
        "minDeposit"?: number;
        "maxDeposit"?: number;
        "minMonthlyRent"?: number;
        "maxMonthlyRent"?: number;
        "roomTypeNames"?: string[];
        "regionFullNames"?: string[];
      };
    "org.example.knockin.global.api.CommonResponseOrg.springframework.data.domain.SliceOrg.example.knockin.dto.MatchListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.springframework.data.domain.SliceOrg.example.knockin.dto.MatchListDto$Response"];
        "status"?: number;
      };
    "org.springframework.data.domain.SliceOrg.example.knockin.dto.MatchListDto$Response": {
        "pageable"?: OpenApiComponents["schemas"]["Pageablenull"];
        "first"?: boolean;
        "last"?: boolean;
        "numberOfElements"?: number;
        "size"?: number;
        "content"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchListDto$Response"][];
        "number"?: number;
        "sort"?: OpenApiComponents["schemas"]["Sortnull"];
        "empty"?: boolean;
      };
    "org.example.knockin.dto.MatchDetailDto$Response": {
        "memberId"?: number;
        "memberProfileImageUrl"?: string;
        "memberName"?: string;
        "memberAge"?: number;
        "gender"?: "MALE" | "FEMALE";
        "isLike"?: boolean;
        "roomProfileType"?: "SEEKER" | "OFFER";
        "seekerProfile"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchListDto$SeekerProfile"];
        "offerProfile"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchListDto$OfferProfile"];
        "lifeStyles"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchListDto$Lifestyle"][];
        "conditions"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchListDto$Condition"][];
        "conditionWeights"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchListDto$ConditionWeight"][];
        "authentications"?: "STUDENT" | "COMPANY"[];
        "compatibility"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchDetailDto$Response$Compatibility"];
      };
    "org.example.knockin.dto.MatchDetailDto$Response$Compatibility": {
        "score"?: number;
        "lifeStyleInfo"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchDetailDto$Response$Compatibility$LifeStyleInfo"][];
      };
    "org.example.knockin.dto.MatchDetailDto$Response$Compatibility$LifeStyleInfo": {
        "title"?: string;
        "percent"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MatchDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.MatchScoreDto$Response": {
        "compatibility"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchScoreDto$Response$Compatibility"];
      };
    "org.example.knockin.dto.MatchScoreDto$Response$Compatibility": {
        "score"?: number;
        "lifeStyleInfo"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchScoreDto$Response$Compatibility$LifeStyleInfo"][];
      };
    "org.example.knockin.dto.MatchScoreDto$Response$Compatibility$LifeStyleInfo": {
        "title"?: string;
        "percent"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MatchScoreDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MatchScoreDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoardListDto$Response": {
        "id"?: number;
        "imageUrl"?: string;
        "title"?: string;
        "deposit"?: number;
        "monthlyRent"?: number;
        "managementCost"?: number;
        "roomTypes"?: string[];
        "comeableDate"?: string;
        "regionFullName"?: string;
        "memberName"?: string;
        "authentications"?: "STUDENT" | "COMPANY"[];
        "hits"?: number;
        "badges"?: "NEW" | "HOT"[];
      };
    "org.example.knockin.global.api.CommonResponseOrg.springframework.data.domain.PageOrg.example.knockin.dto.BoardListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.springframework.data.domain.PageOrg.example.knockin.dto.BoardListDto$Response"];
        "status"?: number;
      };
    "org.springframework.data.domain.PageOrg.example.knockin.dto.BoardListDto$Response": {
        "totalPages"?: number;
        "totalElements"?: number;
        "pageable"?: OpenApiComponents["schemas"]["Pageablenull"];
        "first"?: boolean;
        "last"?: boolean;
        "numberOfElements"?: number;
        "size"?: number;
        "content"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardListDto$Response"][];
        "number"?: number;
        "sort"?: OpenApiComponents["schemas"]["Sortnull"];
        "empty"?: boolean;
      };
    "org.example.knockin.dto.BoardDetailDto$Response": {
        "boardId"?: number;
        "images"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardDetailDto$Response$FileDetailDto"][];
        "title"?: string;
        "deposit"?: number;
        "managementCost"?: number;
        "monthlyRent"?: number;
        "roomTypeName"?: string;
        "regionFullName"?: string;
        "comeableDateNegotiable"?: boolean;
        "comeableDate"?: string;
        "createdAt"?: string;
        "hits"?: number;
        "contents"?: string;
        "roomExtraOptionNames"?: string[];
        "lifeStyles"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardDetailDto$Response$Lifestyle"][];
        "conditions"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardDetailDto$Response$Condition"][];
        "conditionWeights"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardDetailDto$Response$ConditionWeight"][];
        "memberId"?: number;
        "memberName"?: string;
        "memberProfileImageUrl"?: string;
        "memberAge"?: number;
        "gender"?: "MALE" | "FEMALE";
        "authentications"?: "STUDENT" | "COMPANY"[];
        "compatibility"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardDetailDto$Response$Compatibility"];
        "interested"?: boolean;
      };
    "org.example.knockin.dto.BoardDetailDto$Response$Compatibility": {
        "score"?: number;
        "lifeStyleInfo"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardDetailDto$Response$Compatibility$LifeStyleInfo"][];
      };
    "org.example.knockin.dto.BoardDetailDto$Response$Compatibility$LifeStyleInfo": {
        "title"?: string;
        "percent"?: string;
      };
    "org.example.knockin.dto.BoardDetailDto$Response$Condition": {
        "conditionId"?: number;
        "name"?: string;
        "value"?: string;
        "description"?: string;
        "type"?: "SCALE" | "BOOLEAN" | "SINGLE_CHOICE";
      };
    "org.example.knockin.dto.BoardDetailDto$Response$ConditionWeight": {
        "weightConditionId"?: number;
        "name"?: string;
      };
    "org.example.knockin.dto.BoardDetailDto$Response$FileDetailDto": {
        "boardFileId"?: number;
        "url"?: string;
      };
    "org.example.knockin.dto.BoardDetailDto$Response$Lifestyle": {
        "lifestyleId"?: number;
        "name"?: string;
        "value"?: string;
        "description"?: string;
        "type"?: "SCALE" | "BOOLEAN" | "SINGLE_CHOICE";
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoardDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoardEditDto$Response": {
        "images"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardDetailDto$Response$FileDetailDto"][];
        "title": string;
        "deposit": number;
        "monthlyRent": number;
        "managementCost": number;
        "roomType": OpenApiComponents["schemas"]["org.example.knockin.dto.BoardEditDto$Response$RoomTypeInfo"];
        "region": OpenApiComponents["schemas"]["org.example.knockin.dto.BoardEditDto$Response$RegionInfo"];
        "comeableDateNegotiable"?: boolean;
        "comeableDate"?: string;
        "roomExtraOptions"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardEditDto$Response$BoardOptionInfo"][];
        "contents": string;
        "lifeStyles"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardDetailDto$Response$Lifestyle"][];
        "conditions"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardDetailDto$Response$Condition"][];
        "conditionWeights"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardDetailDto$Response$ConditionWeight"][];
      };
    "org.example.knockin.dto.BoardEditDto$Response$BoardOptionInfo": {
        "extraOptionId"?: number;
        "name"?: string;
      };
    "org.example.knockin.dto.BoardEditDto$Response$RegionInfo": {
        "regionId"?: number;
        "fullName"?: string;
      };
    "org.example.knockin.dto.BoardEditDto$Response$RoomTypeInfo": {
        "roomTypeId"?: number;
        "name"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoardEditDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoardEditDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.RoommateRequestListDto$Response": {
        "id"?: number;
        "requesterId"?: number;
        "requesteeId"?: number;
        "chatRoomId"?: number;
        "status"?: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED" | "EXPIRED";
        "createAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.springframework.data.domain.PageOrg.example.knockin.dto.RoommateRequestListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.springframework.data.domain.PageOrg.example.knockin.dto.RoommateRequestListDto$Response"];
        "status"?: number;
      };
    "org.springframework.data.domain.PageOrg.example.knockin.dto.RoommateRequestListDto$Response": {
        "totalPages"?: number;
        "totalElements"?: number;
        "pageable"?: OpenApiComponents["schemas"]["Pageablenull"];
        "first"?: boolean;
        "last"?: boolean;
        "numberOfElements"?: number;
        "size"?: number;
        "content"?: OpenApiComponents["schemas"]["org.example.knockin.dto.RoommateRequestListDto$Response"][];
        "number"?: number;
        "sort"?: OpenApiComponents["schemas"]["Sortnull"];
        "empty"?: boolean;
      };
    "org.example.knockin.dto.MetaRoomTypesDto$Response": {
        "roomType"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MetaRoomTypesDto$Response$RoomTypeItem"][];
      };
    "org.example.knockin.dto.MetaRoomTypesDto$Response$RoomTypeItem": {
        "id"?: number;
        "name"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MetaRoomTypesDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MetaRoomTypesDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.MetaRoomAddOptionsDto$Response": {
        "roomAddOption"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MetaRoomAddOptionsDto$Response$RoomAddOptionItem"][];
      };
    "org.example.knockin.dto.MetaRoomAddOptionsDto$Response$RoomAddOptionItem": {
        "id"?: number;
        "name"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MetaRoomAddOptionsDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MetaRoomAddOptionsDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.MetaRegionsDto$Response": {
        "region"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MetaRegionsDto$Response$RegionItem"][];
      };
    "org.example.knockin.dto.MetaRegionsDto$Response$RegionItem": {
        "id"?: number;
        "name"?: string;
        "parentId"?: number;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MetaRegionsDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MetaRegionsDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.MetaLifestylePatternsDto$Response": {
        "patterns"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MetaLifestylePatternsDto$Response$PatternItem"][];
      };
    "org.example.knockin.dto.MetaLifestylePatternsDto$Response$PatternItem": {
        "id"?: number;
        "name"?: string;
        "type"?: "SCALE" | "BOOLEAN" | "SINGLE_CHOICE";
        "details"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MetaLifestylePatternsDto$Response$PatternItem$DetailItem"][];
      };
    "org.example.knockin.dto.MetaLifestylePatternsDto$Response$PatternItem$DetailItem": {
        "values"?: string;
        "description"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MetaLifestylePatternsDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.MetaLifestylePatternsDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.FaqListDto$Response": {
        "faqInfoList"?: OpenApiComponents["schemas"]["org.example.knockin.dto.FaqListDto$Response$FaqInfo"][];
      };
    "org.example.knockin.dto.FaqListDto$Response$FaqInfo": {
        "id"?: number;
        "title"?: string;
        "sort"?: number;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.FaqListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.FaqListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.FaqAllListDto$Response": {
        "faqInfoList"?: OpenApiComponents["schemas"]["org.example.knockin.dto.FaqAllListDto$Response$FaqInfo"][];
      };
    "org.example.knockin.dto.FaqAllListDto$Response$FaqInfo": {
        "id"?: number;
        "title"?: string;
        "contents"?: string;
        "sort"?: number;
        "createAt"?: string;
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.FaqAllListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.FaqAllListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.FaqDto$Response": {
        "id"?: number;
        "title"?: string;
        "contents"?: string;
        "sort"?: number;
        "createAt"?: string;
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.FaqDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.FaqDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.AuthEmailListDto$Response": {
        "authEmailInfoList"?: OpenApiComponents["schemas"]["org.example.knockin.dto.AuthEmailListDto$Response$AuthEmailInfo"][];
      };
    "org.example.knockin.dto.AuthEmailListDto$Response$AuthEmailInfo": {
        "id"?: number;
        "domain"?: string;
        "name"?: string;
        "type"?: "STUDENT" | "COMPANY";
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.AuthEmailListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.AuthEmailListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.AppVersionDto$Response": {
        "id"?: number;
        "version"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.AppVersionDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.AppVersionDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.InquiryListDto$Response": {
        "inquiries"?: OpenApiComponents["schemas"]["org.example.knockin.dto.InquiryListDto$Response$InquiryItem"][];
      };
    "org.example.knockin.dto.InquiryListDto$Response$InquiryItem": {
        "id"?: number;
        "title"?: string;
        "writer"?: string;
        "status"?: string;
        "createAt"?: string;
        "type"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.InquiryListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.InquiryListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.InquiryDetailDto$Response": {
        "inquirie"?: OpenApiComponents["schemas"]["org.example.knockin.dto.InquiryDetailDto$Response$InquiryDetail"];
      };
    "org.example.knockin.dto.InquiryDetailDto$Response$InquiryDetail": {
        "id"?: number;
        "title"?: string;
        "contents"?: string;
        "writer"?: string;
        "status"?: string;
        "createAt"?: string;
        "type"?: string;
        "reply"?: OpenApiComponents["schemas"]["org.example.knockin.dto.InquiryDetailDto$Response$InquiryDetail$Reply"][];
      };
    "org.example.knockin.dto.InquiryDetailDto$Response$InquiryDetail$Reply": {
        "id"?: number;
        "title"?: string;
        "contents"?: string;
        "writer"?: string;
        "createAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.InquiryDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.InquiryDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.InquiryCategoryListDto$Response": {
        "inquirieCategorys"?: OpenApiComponents["schemas"]["org.example.knockin.dto.InquiryCategoryListDto$Response$Category"][];
      };
    "org.example.knockin.dto.InquiryCategoryListDto$Response$Category": {
        "id"?: number;
        "name"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.InquiryCategoryListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.InquiryCategoryListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.ChatRoomListDto$Response": {
        "chatRoomId"?: number;
        "memberName"?: string;
        "memberProfileImageUrl"?: string;
        "createdAt"?: string;
        "status"?: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED" | "EXPIRED";
        "lastMessage"?: string;
      };
    "org.example.knockin.global.api.CommonResponseJava.util.ListOrg.example.knockin.dto.ChatRoomListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRoomListDto$Response"][];
        "status"?: number;
      };
    "org.example.knockin.dto.ChatRoomDetailDto$ChatMessage": {
        "id"?: number;
        "senderId"?: number;
        "contents"?: string;
        "createdAt"?: string;
        "type"?: "TEXT" | "IMAGE" | "LEFT_ROOM";
        "imageUrl"?: string;
      };
    "org.example.knockin.dto.ChatRoomDetailDto$ProfileInfo": {
        "id"?: number;
        "name"?: string;
        "age"?: number;
        "gender"?: "MALE" | "FEMALE";
        "profileImageUrl"?: string;
        "score"?: number;
      };
    "org.example.knockin.dto.ChatRoomDetailDto$Response": {
        "opponentProfile"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRoomDetailDto$ProfileInfo"];
        "messages"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRoomDetailDto$ChatMessage"][];
        "matchingRequiredList"?: OpenApiComponents["schemas"]["org.example.knockin.dto.RoommateRequestDto$RoommateMatchingRequiredInfo"][];
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ChatRoomDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRoomDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.ChatRequestListDto$Response": {
        "requiredId"?: number;
        "status"?: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED" | "EXPIRED";
        "memberId"?: number;
        "memberName"?: string;
        "memberAge"?: number;
        "gender"?: "MALE" | "FEMALE";
        "score"?: number;
        "createdAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseJava.util.ListOrg.example.knockin.dto.ChatRequestListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRequestListDto$Response"][];
        "status"?: number;
      };
    "org.example.knockin.dto.ChatRequestDetailDto$Response": {
        "requiredId"?: number;
        "status"?: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED" | "EXPIRED";
        "createdAt"?: string;
        "score"?: number;
        "me"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRequestDetailDto$Response$MemberInfo"];
        "opponent"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRequestDetailDto$Response$MemberInfo"];
        "isRequester"?: boolean;
      };
    "org.example.knockin.dto.ChatRequestDetailDto$Response$Lifestyle": {
        "lifestyleId"?: number;
        "name"?: string;
        "value"?: string;
        "description"?: string;
        "type"?: "SCALE" | "BOOLEAN" | "SINGLE_CHOICE";
      };
    "org.example.knockin.dto.ChatRequestDetailDto$Response$MemberInfo": {
        "memberId"?: number;
        "memberName"?: string;
        "memberAge"?: number;
        "gender"?: "MALE" | "FEMALE";
        "profileImageUrl"?: string;
        "lifeStyles"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRequestDetailDto$Response$Lifestyle"][];
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ChatRequestDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.ChatRequestDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoVerificationWaitingListDto$Response": {
        "employeeAuth"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoVerificationWaitingListDto$Response$EmployeeAuthItem"][];
      };
    "org.example.knockin.dto.BoVerificationWaitingListDto$Response$EmployeeAuthItem": {
        "name"?: string;
        "type"?: "STUDENT" | "COMPANY";
        "isAccepted"?: boolean;
        "email"?: string;
        "createAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoVerificationWaitingListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoVerificationWaitingListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoVerificationWaitingDetailDto$Response": {
        "id"?: number;
        "name"?: string;
        "type"?: "STUDENT" | "COMPANY";
        "isAccepted"?: boolean;
        "email"?: string;
        "createAt"?: string;
        "elapsedAt"?: number;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoVerificationWaitingDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoVerificationWaitingDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoVerificationCancelListDto$Response": {
        "employeeAuth"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoVerificationCancelListDto$Response$EmployeeAuthItem"][];
      };
    "org.example.knockin.dto.BoVerificationCancelListDto$Response$EmployeeAuthItem": {
        "name"?: string;
        "type"?: "STUDENT" | "COMPANY";
        "isAccepted"?: boolean;
        "email"?: string;
        "createAt"?: string;
        "description"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoVerificationCancelListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoVerificationCancelListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoVerificationApproveListDto$Response": {
        "employeeAuth"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoVerificationApproveListDto$Response$EmployeeAuthItem"][];
      };
    "org.example.knockin.dto.BoVerificationApproveListDto$Response$EmployeeAuthItem": {
        "name"?: string;
        "type"?: "STUDENT" | "COMPANY";
        "isAccepted"?: boolean;
        "email"?: string;
        "createAt"?: string;
        "accepter"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoVerificationApproveListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoVerificationApproveListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoTypeTermsListDto$Response": {
        "termTypes"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoTypeTermsListDto$Response$TermsTypeItem"][];
      };
    "org.example.knockin.dto.BoTypeTermsListDto$Response$TermsTypeItem": {
        "id"?: number;
        "title"?: string;
        "createAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoTypeTermsListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoTypeTermsListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoTermsListDto$Request": {
        "agreementTypeId"?: number;
      };
    "org.example.knockin.dto.BoTermsListDto$Response": {
        "terms"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoTermsListDto$Response$TermsItem"][];
      };
    "org.example.knockin.dto.BoTermsListDto$Response$TermsItem": {
        "id"?: number;
        "title"?: string;
        "createAt"?: string;
        "current"?: boolean;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoTermsListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoTermsListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoTermsDetailDto$Response": {
        "id"?: number;
        "title"?: string;
        "contents"?: string;
        "createAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoTermsDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoTermsDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoRoomTypeListDto$Response": {
        "roomType"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoRoomTypeListDto$Response$RoomTypeItem"][];
      };
    "org.example.knockin.dto.BoRoomTypeListDto$Response$RoomTypeItem": {
        "id"?: number;
        "name"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoRoomTypeListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoRoomTypeListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoRoomTypeDetailDto$Response": {
        "id"?: number;
        "name"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoRoomTypeDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoRoomTypeDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoReportWaitListDto$Response": {
        "reportInfoList"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoReportWaitListDto$Response$ReportInfo"][];
      };
    "org.example.knockin.dto.BoReportWaitListDto$Response$ReportInfo": {
        "id"?: number;
        "type"?: string;
        "reporter"?: string;
        "reporterId"?: number;
        "reportedId"?: number;
        "createdAt"?: string;
        "reason"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoReportWaitListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoReportWaitListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoReportDoneListDto$Response": {
        "reportInfoList"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoReportDoneListDto$Response$ReportInfo"][];
      };
    "org.example.knockin.dto.BoReportDoneListDto$Response$ReportInfo": {
        "id"?: number;
        "type"?: string;
        "reporter"?: string;
        "declarationType"?: "PENDING" | "NOACTION" | "SUSPENDED" | "HIDDEN";
        "createdAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoReportDoneListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoReportDoneListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoNoticeListDto$Response": {
        "notices"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoNoticeListDto$Response$NoticeItem"][];
      };
    "org.example.knockin.dto.BoNoticeListDto$Response$NoticeItem": {
        "id"?: number;
        "title"?: string;
        "writer"?: string;
        "createAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoNoticeListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoNoticeListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoNoticeDetailDto$Response": {
        "notice"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoNoticeDetailDto$Response$NoticeDetail"];
      };
    "org.example.knockin.dto.BoNoticeDetailDto$Response$NoticeDetail": {
        "id"?: number;
        "title"?: string;
        "contents"?: string;
        "writer"?: string;
        "createAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoNoticeDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoNoticeDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoMemberListDto$Response": {
        "memberInfoList"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoMemberListDto$Response$MemberInfo"][];
      };
    "org.example.knockin.dto.BoMemberListDto$Response$MemberInfo": {
        "id"?: number;
        "name"?: string;
        "email"?: string;
        "createdAt"?: string;
        "authenticationType"?: "STUDENT" | "COMPANY";
        "role"?: "USER" | "ADMIN";
        "state"?: "ACTIVE" | "INACTIVE";
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoMemberListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoMemberListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoMemberDetailDto$Response": {
        "id"?: number;
        "name"?: string;
        "email"?: string;
        "createdAt"?: string;
        "authenticationInfoList"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoMemberDetailDto$Response$AuthenticationInfo"][];
        "role"?: "USER" | "ADMIN";
        "state"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.State"];
        "gender"?: "MALE" | "FEMALE";
        "birth"?: string;
        "reportCount"?: number;
      };
    "org.example.knockin.dto.BoMemberDetailDto$Response$AuthenticationInfo": {
        "authenticationType"?: "STUDENT" | "COMPANY";
        "authenticationEmail"?: string;
      };
    "org.example.knockin.entity.agreement.Agreement": {
        "createdAt"?: string;
        "id"?: number;
        "type"?: OpenApiComponents["schemas"]["org.example.knockin.entity.agreement.AgreementType"];
        "title"?: string;
        "contents"?: string;
        "isDeleted"?: boolean;
        "isRequired"?: boolean;
      };
    "org.example.knockin.entity.agreement.AgreementLog": {
        "createdAt"?: string;
        "id"?: number;
        "agreement"?: OpenApiComponents["schemas"]["org.example.knockin.entity.agreement.Agreement"];
        "isCurrent"?: boolean;
      };
    "org.example.knockin.entity.agreement.AgreementType": {
        "createdAt"?: string;
        "id"?: number;
        "name"?: string;
        "isDeleted"?: boolean;
      };
    "org.example.knockin.entity.agreement.MemberAgreement": {
        "createdAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "agreementLog"?: OpenApiComponents["schemas"]["org.example.knockin.entity.agreement.AgreementLog"];
        "isAgreed"?: boolean;
      };
    "org.example.knockin.entity.alarm.Alarm": {
        "createdAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "title"?: string;
        "contents"?: string;
        "isRead"?: boolean;
        "expiredAt"?: string;
        "type"?: "DEFAULT" | "OFFER" | "CHATTING_REQUIRED";
      };
    "org.example.knockin.entity.alarm.AlarmSetting": {
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "isEnabled"?: boolean;
        "alarmSettingType"?: "NOTIFICATION";
      };
    "org.example.knockin.entity.alarm.Notification": {
        "createdAt"?: string;
        "updatedAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "title"?: string;
        "contents"?: string;
        "isDeleted"?: boolean;
      };
    "org.example.knockin.entity.auth.Authentication": {
        "createdAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "type"?: "STUDENT" | "COMPANY";
        "email"?: string;
        "code"?: string;
        "isAccepted"?: boolean;
        "isDeleted"?: boolean;
      };
    "org.example.knockin.entity.board.RoommateBoard": {
        "createdAt"?: string;
        "updatedAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "title"?: string;
        "contents"?: string;
        "deposit"?: number;
        "monthlyRent"?: number;
        "managementCost"?: number;
        "roomType"?: OpenApiComponents["schemas"]["org.example.knockin.entity.room.RoomType"];
        "region"?: OpenApiComponents["schemas"]["org.example.knockin.entity.room.Region"];
        "comeableDateNegotiable"?: boolean;
        "comeableDate"?: string;
        "isDeleted"?: boolean;
        "hits"?: number;
        "rejectReason"?: string;
      };
    "org.example.knockin.entity.board.RoommateBoardDeclaration": {
        "createdAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "roommateBoard"?: OpenApiComponents["schemas"]["org.example.knockin.entity.board.RoommateBoard"];
        "reason"?: string;
        "declarationType"?: "PENDING" | "NOACTION" | "SUSPENDED" | "HIDDEN";
      };
    "org.example.knockin.entity.board.RoommateBoardInterest": {
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "roommateBoard"?: OpenApiComponents["schemas"]["org.example.knockin.entity.board.RoommateBoard"];
        "isDeleted"?: boolean;
      };
    "org.example.knockin.entity.chat.ChatRoomMember": {
        "id"?: number;
        "chattingRoom"?: OpenApiComponents["schemas"]["org.example.knockin.entity.chat.ChattingRoom"];
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "isLeft"?: boolean;
      };
    "org.example.knockin.entity.chat.ChattingRequired": {
        "createdAt"?: string;
        "id"?: number;
        "requester"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "requestee"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "roommateBoard"?: OpenApiComponents["schemas"]["org.example.knockin.entity.board.RoommateBoard"];
        "status"?: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED" | "EXPIRED";
        "pending"?: boolean;
      };
    "org.example.knockin.entity.chat.ChattingRoom": {
        "createdAt"?: string;
        "id"?: number;
        "chattingRequired"?: OpenApiComponents["schemas"]["org.example.knockin.entity.chat.ChattingRequired"];
      };
    "org.example.knockin.entity.inquiry.Inquiry": {
        "createdAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "inquiryCategory"?: OpenApiComponents["schemas"]["org.example.knockin.entity.inquiry.InquiryCategory"];
        "title"?: string;
        "contents"?: string;
        "isDeleted"?: boolean;
      };
    "org.example.knockin.entity.inquiry.InquiryCategory": {
        "createdAt"?: string;
        "id"?: number;
        "title"?: string;
        "isDeleted"?: boolean;
      };
    "org.example.knockin.entity.inquiry.InquiryComment": {
        "createdAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "inquiry"?: OpenApiComponents["schemas"]["org.example.knockin.entity.inquiry.Inquiry"];
        "contents"?: string;
        "isDeleted"?: boolean;
      };
    "org.example.knockin.entity.life.LifePattern": {
        "createdAt"?: string;
        "id"?: number;
        "name"?: string;
        "dtype"?: "SCALE" | "BOOLEAN" | "SINGLE_CHOICE";
        "isDeleted"?: boolean;
        "sort"?: number;
      };
    "org.example.knockin.entity.life.LifePatternInformation": {
        "id"?: number;
        "lifePattern"?: OpenApiComponents["schemas"]["org.example.knockin.entity.life.LifePattern"];
        "dvalue"?: string;
        "description"?: string;
      };
    "org.example.knockin.entity.life.MemberLifePattern": {
        "createdAt"?: string;
        "updatedAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "lifePatternInformation"?: OpenApiComponents["schemas"]["org.example.knockin.entity.life.LifePatternInformation"];
      };
    "org.example.knockin.entity.life.PreferenceCondition": {
        "createdAt"?: string;
        "updatedAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "lifePatternInformation"?: OpenApiComponents["schemas"]["org.example.knockin.entity.life.LifePatternInformation"];
      };
    "org.example.knockin.entity.member.BasicInformation": {
        "createdAt"?: string;
        "updatedAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "name"?: string;
        "birth"?: string;
        "gender"?: "MALE" | "FEMALE";
        "email"?: string;
      };
    "org.example.knockin.entity.member.Block": {
        "createdAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "isDeleted"?: boolean;
      };
    "org.example.knockin.entity.member.Member": {
        "createdAt"?: string;
        "id"?: number;
        "providerType"?: "KAKAO" | "APPLE";
        "providerId"?: string;
        "role"?: "USER" | "ADMIN";
        "deletedAt"?: string;
        "memberAgreements"?: OpenApiComponents["schemas"]["org.example.knockin.entity.agreement.MemberAgreement"][];
        "alarms"?: OpenApiComponents["schemas"]["org.example.knockin.entity.alarm.Alarm"][];
        "alarmSettings"?: OpenApiComponents["schemas"]["org.example.knockin.entity.alarm.AlarmSetting"][];
        "notifications"?: OpenApiComponents["schemas"]["org.example.knockin.entity.alarm.Notification"][];
        "authentications"?: OpenApiComponents["schemas"]["org.example.knockin.entity.auth.Authentication"][];
        "roommateBoards"?: OpenApiComponents["schemas"]["org.example.knockin.entity.board.RoommateBoard"][];
        "roommateBoardDeclarations"?: OpenApiComponents["schemas"]["org.example.knockin.entity.board.RoommateBoardDeclaration"][];
        "roommateBoardInterests"?: OpenApiComponents["schemas"]["org.example.knockin.entity.board.RoommateBoardInterest"][];
        "chatRoomMembers"?: OpenApiComponents["schemas"]["org.example.knockin.entity.chat.ChatRoomMember"][];
        "inquiries"?: OpenApiComponents["schemas"]["org.example.knockin.entity.inquiry.Inquiry"][];
        "inquiryComments"?: OpenApiComponents["schemas"]["org.example.knockin.entity.inquiry.InquiryComment"][];
        "memberLifePatterns"?: OpenApiComponents["schemas"]["org.example.knockin.entity.life.MemberLifePattern"][];
        "preferenceConditions"?: OpenApiComponents["schemas"]["org.example.knockin.entity.life.PreferenceCondition"][];
        "basicInformations"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.BasicInformation"][];
        "blocks"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Block"][];
        "memberPrivacy"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.MemberPrivacy"];
        "searches"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Search"][];
        "states"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.State"][];
        "roomProfiles"?: OpenApiComponents["schemas"]["org.example.knockin.entity.room.RoomProfile"][];
        "delete"?: boolean;
      };
    "org.example.knockin.entity.member.MemberPrivacy": {
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "type"?: "PUBLIC" | "PRIVATE";
      };
    "org.example.knockin.entity.member.Search": {
        "createdAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "keyword"?: string;
      };
    "org.example.knockin.entity.member.State": {
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "states"?: "ACTIVE" | "INACTIVE";
        "rejectReason"?: string;
      };
    "org.example.knockin.entity.room.Region": {
        "id"?: number;
        "name"?: string;
        "scope"?: number;
        "parent"?: OpenApiComponents["schemas"]["org.example.knockin.entity.room.Region"];
      };
    "org.example.knockin.entity.room.RoomProfile": {
        "createdAt"?: string;
        "id"?: number;
        "member"?: OpenApiComponents["schemas"]["org.example.knockin.entity.member.Member"];
        "type"?: "SEEKER" | "OFFER";
        "isComeableAtNegotiable"?: boolean;
        "comeableAt"?: string;
      };
    "org.example.knockin.entity.room.RoomType": {
        "id"?: number;
        "name"?: string;
        "isDeleted"?: boolean;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoMemberDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoMemberDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoLifeStylePatternListDto$Response": {
        "patterns"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoLifeStylePatternListDto$Response$PatternItem"][];
      };
    "org.example.knockin.dto.BoLifeStylePatternListDto$Response$PatternItem": {
        "id"?: number;
        "name"?: string;
        "type"?: "SCALE" | "BOOLEAN" | "SINGLE_CHOICE";
        "details"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoLifeStylePatternListDto$Response$PatternItem$DetailItem"][];
      };
    "org.example.knockin.dto.BoLifeStylePatternListDto$Response$PatternItem$DetailItem": {
        "values"?: string;
        "description"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoLifeStylePatternListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoLifeStylePatternListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoLifeStylePatternDetailDto$Response": {
        "id"?: number;
        "name"?: string;
        "type"?: "SCALE" | "BOOLEAN" | "SINGLE_CHOICE";
        "details"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoLifeStylePatternDetailDto$Response$DetailItem"][];
      };
    "org.example.knockin.dto.BoLifeStylePatternDetailDto$Response$DetailItem": {
        "values"?: string;
        "description"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoLifeStylePatternDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoLifeStylePatternDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoInquiryListDto$Response": {
        "inquiries"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoInquiryListDto$Response$InquiryItem"][];
      };
    "org.example.knockin.dto.BoInquiryListDto$Response$InquiryItem": {
        "id"?: number;
        "title"?: string;
        "writer"?: string;
        "status"?: string;
        "createAt"?: string;
        "type"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoInquiryListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoInquiryListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoInquiryDetailDto$Response": {
        "inquirie"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoInquiryDetailDto$Response$InquiryDetail"];
      };
    "org.example.knockin.dto.BoInquiryDetailDto$Response$InquiryDetail": {
        "id"?: number;
        "title"?: string;
        "contents"?: string;
        "writer"?: string;
        "status"?: string;
        "createAt"?: string;
        "type"?: string;
        "reply"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoInquiryDetailDto$Response$InquiryDetail$Reply"][];
      };
    "org.example.knockin.dto.BoInquiryDetailDto$Response$InquiryDetail$Reply": {
        "id"?: number;
        "contents"?: string;
        "writer"?: string;
        "createAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoInquiryDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoInquiryDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoBoardListDto$Response": {
        "boardInfoList"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoBoardListDto$Response$BoardInfo"][];
      };
    "org.example.knockin.dto.BoBoardListDto$Response$BoardInfo": {
        "id"?: number;
        "title"?: string;
        "writer"?: string;
        "region"?: string;
        "comeableDate"?: string;
        "createdAt"?: string;
        "comeableDateNegotiable"?: boolean;
        "deleted"?: boolean;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoBoardListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoBoardListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoBoardDetailDto$Response": {
        "thumbnailImage"?: string;
        "title"?: string;
        "writer"?: string;
        "writerId"?: number;
        "region"?: string;
        "deposit"?: number;
        "monthlyRent"?: number;
        "comeableDateNegotiable"?: boolean;
        "comeableDate"?: string;
        "createdAt"?: string;
        "hits"?: number;
        "deleted"?: boolean;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoBoardDetailDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoBoardDetailDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BlockListDto$Response": {
        "blocks"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BlockListDto$Response$Block"][];
      };
    "org.example.knockin.dto.BlockListDto$Response$Block": {
        "userId"?: number;
        "name"?: string;
        "createAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BlockListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BlockListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.global.api.CommonResponseJava.lang.String": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: string;
        "status"?: number;
      };
    "org.example.knockin.dto.AlarmListDto$Response": {
        "alarms"?: OpenApiComponents["schemas"]["org.example.knockin.dto.AlarmListDto$Response$Alarm"][];
      };
    "org.example.knockin.dto.AlarmListDto$Response$Alarm": {
        "id"?: number;
        "title"?: string;
        "contents"?: string;
        "isRead"?: boolean;
        "expiredAt"?: string;
        "createAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.AlarmListDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.AlarmListDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.AlarmSubscribeDto$Response": {
        "sseEmitter"?: OpenApiComponents["schemas"]["org.springframework.web.servlet.mvc.method.annotation.SseEmitter"];
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.AlarmSubscribeDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.AlarmSubscribeDto$Response"];
        "status"?: number;
      };
    "org.springframework.web.servlet.mvc.method.annotation.SseEmitter": {
        "timeout"?: number;
      };
    "org.example.knockin.dto.DeleteUserDto$Response": Record<string, never>;
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.DeleteUserDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.DeleteUserDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.FaqDeleteDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.FaqDeleteDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.FaqDeleteDto$Response"];
        "status"?: number;
      };
    "org.example.knockin.dto.BoBoardDeleteDto$Response": {
        "updatedAt"?: string;
      };
    "org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoBoardDeleteDto$Response": {
        "error"?: OpenApiComponents["schemas"]["org.example.knockin.global.api.ErrorResponse"];
        "data"?: OpenApiComponents["schemas"]["org.example.knockin.dto.BoBoardDeleteDto$Response"];
        "status"?: number;
      };
  };
}

export type OpenApiSchemas = OpenApiComponents["schemas"];
export type OpenApiSchema<K extends keyof OpenApiSchemas> = OpenApiSchemas[K];
