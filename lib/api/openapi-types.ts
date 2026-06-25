// This file is generated from https://api.knock-in.com/v3/api-docs.
// Run `node scripts/generate-openapi-types.js` to refresh it.

export interface OpenApiComponents {
  schemas: {
    'org.example.knockin.dto.ModifyProfileRoomInfoDto$Request': {
      type?: 'SEEKER' | 'OFFER';
      minDeposit?: number;
      maxDeposit?: number;
      minMounthRent?: number;
      maxMounthRent?: number;
      comeEnableAt?: string;
      region?: number[];
      roomProfile?: number[];
      deposit?: number;
      mounthRent?: number;
    };
    'org.example.knockin.dto.ModifyProfileRoomInfoDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyProfileRoomInfoDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.ModifyProfileRoomInfoDto$Response'];
      status?: number;
    };
    'org.example.knockin.global.api.ErrorResponse': {
      code?: string;
      message?: string;
    };
    'org.example.knockin.dto.ModifyProfileLifeStyleDto$Request': {
      lifestyles?: number[];
    };
    'org.example.knockin.dto.ModifyProfileLifeStyleDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyProfileLifeStyleDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.ModifyProfileLifeStyleDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.ModifyProfileBasicDto$Request': {
      name?: string;
      birth?: string;
      gender?: 'MALE' | 'FEMALE';
      email?: string;
      terms?: number[];
    };
    'org.example.knockin.dto.ModifyProfileBasicDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyProfileBasicDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.ModifyProfileBasicDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.ModifyProfileAllDto$Request': {
      name?: string;
      birth?: string;
      gender?: 'MALE' | 'FEMALE';
      email?: string;
      terms?: number[];
      lifestyles?: number[];
      type?: 'SEEKER' | 'OFFER';
      minDeposit?: number;
      maxDeposit?: number;
      minMounthRent?: number;
      maxMounthRent?: number;
      comeEnableAt?: string;
      region?: number[];
      roomProfile?: number[];
      deposit?: number;
      mounthRent?: number;
    };
    'org.example.knockin.dto.ModifyProfileAllDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyProfileAllDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.ModifyProfileAllDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.ModifyPreferencesLifeStyleDto$Request': {
      lifestyles?: number[];
    };
    'org.example.knockin.dto.ModifyPreferencesLifeStyleDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyPreferencesLifeStyleDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.ModifyPreferencesLifeStyleDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.ModifyPreferencesConditionsDto$Request': {
      conditions?: number[];
    };
    'org.example.knockin.dto.ModifyPreferencesConditionsDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyPreferencesConditionsDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.ModifyPreferencesConditionsDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.ModifyPreferencesAllDto$Request': {
      lifestyles?: number[];
      conditions?: number[];
    };
    'org.example.knockin.dto.ModifyPreferencesAllDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ModifyPreferencesAllDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.ModifyPreferencesAllDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.CalendarDto$Request': {
      roommateId?: number;
      title?: string;
      contents?: string;
      startDt?: string;
      endDt?: string;
    };
    'org.example.knockin.dto.CalendarDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.CalendarDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.CalendarDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoardDto$Request': {
      title?: string;
      contents?: string;
      deposit?: number;
      mountlyRent?: number;
      managementCost?: number;
      roomType?: number;
      region?: number;
      comeableAt?: string;
      images?: OpenApiComponents['schemas']['org.example.knockin.dto.BoardDto$Request$ImageDto'][];
    };
    'org.example.knockin.dto.BoardDto$Request$ImageDto': {
      image?: string;
      thumnail?: boolean;
    };
    'org.example.knockin.dto.BoardDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoardDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoardDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoTermsDto$Request': {
      title?: string;
      contents?: string;
    };
    'org.example.knockin.dto.BoTermsDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoTermsDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoTermsDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoRoomTypeDto$Request': {
      name?: string;
    };
    'org.example.knockin.dto.BoRoomTypeDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoRoomTypeDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoRoomTypeDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoNoticeDto$Request': {
      title?: string;
      contents?: string;
    };
    'org.example.knockin.dto.BoNoticeDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoNoticeDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoNoticeDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoLifeStylePatternDto$Request': {
      name?: string;
      type?: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
      value?: string;
      description?: string;
    };
    'org.example.knockin.dto.BoLifeStylePatternDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoLifeStylePatternDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoLifeStylePatternDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.SaveProfileRoomInfoDto$Request': {
      type?: 'SEEKER' | 'OFFER';
      minDeposit?: number;
      maxDeposit?: number;
      minMounthRent?: number;
      maxMounthRent?: number;
      comeEnableAt?: string;
      region?: number[];
      roomProfile?: number[];
      deposit?: number;
      mounthRent?: number;
      comeableAtNegotiable?: boolean;
    };
    'org.example.knockin.dto.SaveProfileRoomInfoDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SaveProfileRoomInfoDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.SaveProfileRoomInfoDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.SaveProfileLifeStyleDto$Request': {
      lifestyles?: number[];
    };
    'org.example.knockin.dto.SaveProfileLifeStyleDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SaveProfileLifeStyleDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.SaveProfileLifeStyleDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.SaveProfileBasicDto$Request': {
      name?: string;
      birth?: string;
      gender?: 'MALE' | 'FEMALE';
      email?: string;
      terms?: number[];
    };
    'org.example.knockin.dto.SaveProfileBasicDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SaveProfileBasicDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.SaveProfileBasicDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.SaveProfileAllDto$Request': {
      name?: string;
      birth?: string;
      gender?: 'MALE' | 'FEMALE';
      email?: string;
      terms?: number[];
      lifestyles?: number[];
      type?: 'SEEKER' | 'OFFER';
      minDeposit?: number;
      maxDeposit?: number;
      minMounthRent?: number;
      maxMounthRent?: number;
      comeEnableAt?: string;
      region?: number[];
      roomProfile?: number[];
      deposit?: number;
      mounthRent?: number;
      comeableAtNegotiable?: boolean;
    };
    'org.example.knockin.dto.SaveProfileAllDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SaveProfileAllDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.SaveProfileAllDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.SavePreferencesLifeStyleDto$Request': {
      lifestyles?: number[];
    };
    'org.example.knockin.dto.SavePreferencesLifeStyleDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SavePreferencesLifeStyleDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.SavePreferencesLifeStyleDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.SavePreferencesConditionsDto$Request': {
      conditions?: number[];
    };
    'org.example.knockin.dto.SavePreferencesConditionsDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SavePreferencesConditionsDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.SavePreferencesConditionsDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.SavePreferencesAllDto$Request': {
      lifestyles?: number[];
      conditions?: number[];
    };
    'org.example.knockin.dto.SavePreferencesAllDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.SavePreferencesAllDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.SavePreferencesAllDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.ReportDto$Request': {
      contents?: string;
    };
    'org.example.knockin.dto.ReportDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ReportDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.ReportDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.RoommateRequestDto$Request': {
      chatRoomId?: number;
    };
    'org.example.knockin.dto.RoommateRequestDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.RoommateRequestDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.RoommateRequestDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.InquiryDto$Request': {
      categoryId?: number;
      title?: string;
      contents?: string;
    };
    'org.example.knockin.dto.InquiryDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.InquiryDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.InquiryDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.ChatRequestDto$Request': {
      requestee?: number;
      boardId?: number;
    };
    'org.example.knockin.dto.ChatRequestDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ChatRequestDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.ChatRequestDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoInquiryReplyDto$Request': {
      inquirieId?: number;
      contents?: string;
    };
    'org.example.knockin.dto.BoInquiryReplyDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoInquiryReplyDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoInquiryReplyDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BlockDto$Request': {
      userId?: number;
    };
    'org.example.knockin.dto.BlockDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BlockDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BlockDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.EmailSendDto$Request': {
      email?: string;
    };
    'org.example.knockin.dto.EmailSendDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.EmailSendDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.EmailSendDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.EmailConfirmDto$Request': {
      email?: string;
      authNo?: string;
    };
    'org.example.knockin.dto.EmailConfirmDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.EmailConfirmDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.EmailConfirmDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.ProfileVisibilityDto$Request': {
      status?: string;
    };
    'org.example.knockin.dto.ProfileVisibilityDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ProfileVisibilityDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.ProfileVisibilityDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.AlarmSettingDto$Request': {
      settingId?: number;
      enabled?: boolean;
    };
    'org.example.knockin.dto.AlarmSettingDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.AlarmSettingDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.AlarmSettingDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoVerificationCompanyDto$Response': {
      updatedAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoVerificationCompanyDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoVerificationCompanyDto$Response'];
      status?: number;
    };
    'org.springdoc.core.converters.models.Pageable': {
      page?: number;
      size?: number;
      sort?: string[];
    };
    'org.example.knockin.dto.MyVerificationListDto$Response': {
      studentAuth?: OpenApiComponents['schemas']['org.example.knockin.dto.MyVerificationListDto$Response$AuthInfo'];
      employeeAuth?: OpenApiComponents['schemas']['org.example.knockin.dto.MyVerificationListDto$Response$AuthInfo'];
    };
    'org.example.knockin.dto.MyVerificationListDto$Response$AuthInfo': {
      isAccepted?: boolean;
      email?: string;
      createAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyVerificationListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MyVerificationListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MyProfileAllDto$Response': {
      lifestyles?: OpenApiComponents['schemas']['org.example.knockin.dto.MyProfileAllDto$Response$Lifestyle'][];
      type?: 'SEEKER' | 'OFFER';
      minDeposit?: number;
      maxDeposit?: number;
      minMounthRent?: number;
      maxMounthRent?: number;
      comeEnableAt?: string;
      region?: OpenApiComponents['schemas']['org.example.knockin.dto.MyProfileAllDto$Response$Region'][];
      roomProfile?: OpenApiComponents['schemas']['org.example.knockin.dto.MyProfileAllDto$Response$RoomProfile'][];
      deposit?: number;
      mounthRent?: number;
    };
    'org.example.knockin.dto.MyProfileAllDto$Response$Lifestyle': {
      lifestyleId?: number;
      name?: string;
      value?: string;
      description?: string;
      type?: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
    };
    'org.example.knockin.dto.MyProfileAllDto$Response$Region': {
      regionId?: number;
      region?: string;
    };
    'org.example.knockin.dto.MyProfileAllDto$Response$RoomProfile': {
      roomProfileId?: number;
      roomProfileName?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyProfileAllDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MyProfileAllDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MyPreferencesAllDto$Response': {
      lifestyles?: OpenApiComponents['schemas']['org.example.knockin.dto.MyPreferencesAllDto$Response$Lifestyle'][];
      conditions?: OpenApiComponents['schemas']['org.example.knockin.dto.MyPreferencesAllDto$Response$Condition'][];
    };
    'org.example.knockin.dto.MyPreferencesAllDto$Response$Condition': {
      conditionsId?: number;
      name?: string;
    };
    'org.example.knockin.dto.MyPreferencesAllDto$Response$Lifestyle': {
      lifestyleId?: number;
      name?: string;
      value?: string;
      description?: string;
      type?: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyPreferencesAllDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MyPreferencesAllDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MyNotificationSettingsDto$Response': {
      alarmsSettings?: OpenApiComponents['schemas']['org.example.knockin.dto.MyNotificationSettingsDto$Response$AlarmSettingItem'][];
    };
    'org.example.knockin.dto.MyNotificationSettingsDto$Response$AlarmSettingItem': {
      id?: number;
      name?: string;
      isEnable?: boolean;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyNotificationSettingsDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MyNotificationSettingsDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MyBoardListDto$Response': {
      boards?: OpenApiComponents['schemas']['org.example.knockin.dto.MyBoardListDto$Response$BoardItem'][];
    };
    'org.example.knockin.dto.MyBoardListDto$Response$BoardItem': {
      boardId?: number;
      image?: string;
      title?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyBoardListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MyBoardListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.TermsListDto$Response': {
      terms?: OpenApiComponents['schemas']['org.example.knockin.dto.TermsListDto$Response$TermsItem'][];
    };
    'org.example.knockin.dto.TermsListDto$Response$TermsItem': {
      id?: number;
      title?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.TermsListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.TermsListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.TermsDetailDto$Response': {
      id?: number;
      contents?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.TermsDetailDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.TermsDetailDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.PopularSearchDto$Response': {
      rank?: OpenApiComponents['schemas']['org.example.knockin.dto.PopularSearchDto$Response$RankItem'][];
    };
    'org.example.knockin.dto.PopularSearchDto$Response$RankItem': {
      id?: number;
      keyword?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.PopularSearchDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.PopularSearchDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MyRoommateDto$Response': {
      userId?: number;
      userName?: string;
      compatibility?: OpenApiComponents['schemas']['org.example.knockin.dto.MyRoommateDto$Response$Compatibility'];
      preferences?: OpenApiComponents['schemas']['org.example.knockin.dto.MyRoommateDto$Response$Lifestyle'][];
    };
    'org.example.knockin.dto.MyRoommateDto$Response$Compatibility': {
      score?: number;
      lifeStyleInfo?: OpenApiComponents['schemas']['org.example.knockin.dto.MyRoommateDto$Response$LifeStyleInfo'][];
    };
    'org.example.knockin.dto.MyRoommateDto$Response$LifeStyleInfo': {
      title?: string;
      percent?: string;
    };
    'org.example.knockin.dto.MyRoommateDto$Response$Lifestyle': {
      lifestyleId?: number;
      name?: string;
      value?: string;
      description?: string;
      type?: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyRoommateDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MyRoommateDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MyRoommateCalendarListDto$Response': {
      calendars?: OpenApiComponents['schemas']['org.example.knockin.dto.MyRoommateCalendarListDto$Response$Calendar'][];
    };
    'org.example.knockin.dto.MyRoommateCalendarListDto$Response$Calendar': {
      calendarId?: number;
      writer?: string;
      startDt?: string;
      endDt?: string;
      createAt?: string;
      type?: string;
      title?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyRoommateCalendarListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MyRoommateCalendarListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MyRoommateCalendarDetailDto$Response': {
      id?: number;
      title?: string;
      contents?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MyRoommateCalendarDetailDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MyRoommateCalendarDetailDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.CalendarTypesDto$Response': {
      types?: OpenApiComponents['schemas']['org.example.knockin.dto.CalendarTypesDto$Response$Type'][];
    };
    'org.example.knockin.dto.CalendarTypesDto$Response$Type': {
      id?: number;
      name?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.CalendarTypesDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.CalendarTypesDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MatchListDto$Response': {
      matches?: OpenApiComponents['schemas']['org.example.knockin.dto.MatchListDto$Response$Match'][];
    };
    'org.example.knockin.dto.MatchListDto$Response$Condition': {
      conditionsId?: number;
      name?: string;
    };
    'org.example.knockin.dto.MatchListDto$Response$Lifestyle': {
      lifestyleId?: number;
      name?: string;
      value?: string;
      description?: string;
      type?: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
    };
    'org.example.knockin.dto.MatchListDto$Response$Match': {
      userId?: number;
      name?: string;
      isLike?: boolean;
      roomProfileType?: 'SEEKER' | 'OFFER';
      deposit?: number;
      mounthRent?: number;
      minDeposit?: number;
      minMounthRent?: number;
      maxDeposit?: number;
      maxMounthRent?: number;
      comeableAt?: string;
      roomType?: number[];
      region?: number;
      score?: number;
      lifeStyles?: OpenApiComponents['schemas']['org.example.knockin.dto.MatchListDto$Response$Lifestyle'][];
      conditions?: OpenApiComponents['schemas']['org.example.knockin.dto.MatchListDto$Response$Condition'][];
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MatchListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MatchListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MatchDetailDto$Response': {
      minDeposit?: number;
      maxDeposit?: number;
      deposit?: number;
      minMounthRent?: number;
      maxMounthRent?: number;
      mounthRent?: number;
      roomProfileType?: 'SEEKER' | 'OFFER';
      region?: number;
      roomOption?: number[];
      comeableAt?: string;
      lifeStyles?: OpenApiComponents['schemas']['org.example.knockin.dto.MatchDetailDto$Response$Lifestyle'][];
      preferences?: OpenApiComponents['schemas']['org.example.knockin.dto.MatchDetailDto$Response$Preference'][];
      conditions?: OpenApiComponents['schemas']['org.example.knockin.dto.MatchDetailDto$Response$Condition'][];
      name?: string;
      isAuthStudent?: boolean;
      isAuthEmployee?: boolean;
      compatibility?: OpenApiComponents['schemas']['org.example.knockin.dto.MatchDetailDto$Response$Compatibility'];
    };
    'org.example.knockin.dto.MatchDetailDto$Response$Compatibility': {
      score?: number;
      lifeStyleInfo?: OpenApiComponents['schemas']['org.example.knockin.dto.MatchDetailDto$Response$Compatibility$LifeStyleInfo'][];
    };
    'org.example.knockin.dto.MatchDetailDto$Response$Compatibility$LifeStyleInfo': {
      title?: string;
      percent?: string;
    };
    'org.example.knockin.dto.MatchDetailDto$Response$Condition': {
      conditionsId?: number;
      name?: string;
    };
    'org.example.knockin.dto.MatchDetailDto$Response$Lifestyle': {
      lifestyleId?: number;
      name?: string;
      value?: string;
      description?: string;
      type?: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
    };
    'org.example.knockin.dto.MatchDetailDto$Response$Preference': {
      preferencesId?: number;
      name?: string;
      value?: string;
      description?: string;
      type?: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MatchDetailDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MatchDetailDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MatchScoreDto$Response': {
      compatibility?: OpenApiComponents['schemas']['org.example.knockin.dto.MatchScoreDto$Response$Compatibility'];
    };
    'org.example.knockin.dto.MatchScoreDto$Response$Compatibility': {
      score?: number;
      lifeStyleInfo?: OpenApiComponents['schemas']['org.example.knockin.dto.MatchScoreDto$Response$Compatibility$LifeStyleInfo'][];
    };
    'org.example.knockin.dto.MatchScoreDto$Response$Compatibility$LifeStyleInfo': {
      title?: string;
      percent?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MatchScoreDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MatchScoreDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoardListDto$Response': {
      boards?: OpenApiComponents['schemas']['org.example.knockin.dto.BoardListDto$Response$BoardItem'][];
    };
    'org.example.knockin.dto.BoardListDto$Response$BoardItem': {
      boardId?: number;
      image?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoardListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoardListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoardDetailDto$Response': {
      boardId?: number;
      images?: string[];
      title?: string;
      deposit?: number;
      mounthRent?: number;
      roomType?: number;
      region?: number;
      createAt?: string;
      viewer?: number;
      contents?: string;
      roomOption?: number[];
      lifeStyles?: OpenApiComponents['schemas']['org.example.knockin.dto.BoardDetailDto$Response$Lifestyle'][];
      preferences?: OpenApiComponents['schemas']['org.example.knockin.dto.BoardDetailDto$Response$Preference'][];
      conditions?: OpenApiComponents['schemas']['org.example.knockin.dto.BoardDetailDto$Response$Condition'][];
      writer?: string;
      isAuthStudent?: boolean;
      isAuthEmployee?: boolean;
      compatibility?: OpenApiComponents['schemas']['org.example.knockin.dto.BoardDetailDto$Response$Compatibility'];
    };
    'org.example.knockin.dto.BoardDetailDto$Response$Compatibility': {
      score?: number;
      lifeStyleInfo?: OpenApiComponents['schemas']['org.example.knockin.dto.BoardDetailDto$Response$Compatibility$LifeStyleInfo'][];
    };
    'org.example.knockin.dto.BoardDetailDto$Response$Compatibility$LifeStyleInfo': {
      title?: string;
      percent?: string;
    };
    'org.example.knockin.dto.BoardDetailDto$Response$Condition': {
      conditionsId?: number;
      name?: string;
    };
    'org.example.knockin.dto.BoardDetailDto$Response$Lifestyle': {
      lifestyleId?: number;
      name?: string;
      value?: string;
      description?: string;
      type?: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
    };
    'org.example.knockin.dto.BoardDetailDto$Response$Preference': {
      preferencesId?: number;
      name?: string;
      value?: string;
      description?: string;
      type?: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoardDetailDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoardDetailDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.RoommateRequestListDto$Response': {
      roommateRequests?: OpenApiComponents['schemas']['org.example.knockin.dto.RoommateRequestListDto$Response$RoommateRequest'][];
    };
    'org.example.knockin.dto.RoommateRequestListDto$Response$RoommateRequest': {
      requester?: number;
      reqeustee?: number;
      createAt?: string;
      chatRoomId?: number;
      isAgree?: boolean;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.RoommateRequestListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.RoommateRequestListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MetaRoomTypesDto$Response': {
      roomType?: OpenApiComponents['schemas']['org.example.knockin.dto.MetaRoomTypesDto$Response$RoomTypeItem'][];
    };
    'org.example.knockin.dto.MetaRoomTypesDto$Response$RoomTypeItem': {
      id?: number;
      name?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MetaRoomTypesDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MetaRoomTypesDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MetaRoomAddOptionsDto$Response': {
      roomAddOption?: OpenApiComponents['schemas']['org.example.knockin.dto.MetaRoomAddOptionsDto$Response$RoomAddOptionItem'][];
    };
    'org.example.knockin.dto.MetaRoomAddOptionsDto$Response$RoomAddOptionItem': {
      id?: number;
      name?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MetaRoomAddOptionsDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MetaRoomAddOptionsDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MetaRegionsDto$Response': {
      region?: OpenApiComponents['schemas']['org.example.knockin.dto.MetaRegionsDto$Response$RegionItem'][];
    };
    'org.example.knockin.dto.MetaRegionsDto$Response$RegionItem': {
      id?: number;
      name?: string;
      parentId?: number;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MetaRegionsDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MetaRegionsDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.MetaLifestylePatternsDto$Response': {
      patterns?: OpenApiComponents['schemas']['org.example.knockin.dto.MetaLifestylePatternsDto$Response$PatternItem'][];
    };
    'org.example.knockin.dto.MetaLifestylePatternsDto$Response$PatternItem': {
      id?: number;
      name?: string;
      type?: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
      details?: OpenApiComponents['schemas']['org.example.knockin.dto.MetaLifestylePatternsDto$Response$PatternItem$DetailItem'][];
    };
    'org.example.knockin.dto.MetaLifestylePatternsDto$Response$PatternItem$DetailItem': {
      values?: string;
      description?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.MetaLifestylePatternsDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.MetaLifestylePatternsDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.InquiryListDto$Response': {
      inquiries?: OpenApiComponents['schemas']['org.example.knockin.dto.InquiryListDto$Response$InquiryItem'][];
    };
    'org.example.knockin.dto.InquiryListDto$Response$InquiryItem': {
      id?: number;
      title?: string;
      writer?: string;
      status?: string;
      createAt?: string;
      type?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.InquiryListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.InquiryListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.InquiryDetailDto$Response': {
      inquirie?: OpenApiComponents['schemas']['org.example.knockin.dto.InquiryDetailDto$Response$InquiryDetail'];
    };
    'org.example.knockin.dto.InquiryDetailDto$Response$InquiryDetail': {
      id?: number;
      title?: string;
      contents?: string;
      writer?: string;
      status?: string;
      createAt?: string;
      type?: string;
      reply?: OpenApiComponents['schemas']['org.example.knockin.dto.InquiryDetailDto$Response$InquiryDetail$Reply'][];
    };
    'org.example.knockin.dto.InquiryDetailDto$Response$InquiryDetail$Reply': {
      id?: number;
      title?: string;
      contents?: string;
      writer?: string;
      createAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.InquiryDetailDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.InquiryDetailDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.InquiryCategoryListDto$Response': {
      inquirieCategorys?: OpenApiComponents['schemas']['org.example.knockin.dto.InquiryCategoryListDto$Response$Category'][];
    };
    'org.example.knockin.dto.InquiryCategoryListDto$Response$Category': {
      id?: number;
      name?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.InquiryCategoryListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.InquiryCategoryListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.ChatRoomListDto$Response': {
      chatRooms?: OpenApiComponents['schemas']['org.example.knockin.dto.ChatRoomListDto$Response$ChatRoom'][];
    };
    'org.example.knockin.dto.ChatRoomListDto$Response$ChatRoom': {
      name?: string;
      creatAt?: string;
      chatRoomId?: number;
      isAgree?: boolean;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ChatRoomListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.ChatRoomListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.ChatRequestListDto$Response': {
      chatRequireds?: OpenApiComponents['schemas']['org.example.knockin.dto.ChatRequestListDto$Response$ChatRequired'][];
    };
    'org.example.knockin.dto.ChatRequestListDto$Response$ChatRequired': {
      name?: string;
      type?: string;
      score?: number;
      creatAt?: string;
      chatReqId?: number;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ChatRequestListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.ChatRequestListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.ChatRequestDetailDto$Response': {
      requester?: OpenApiComponents['schemas']['org.example.knockin.dto.ChatRequestDetailDto$Response$RequesterInfo'];
      requestee?: OpenApiComponents['schemas']['org.example.knockin.dto.ChatRequestDetailDto$Response$RequesteeInfo'];
    };
    'org.example.knockin.dto.ChatRequestDetailDto$Response$Lifestyle': {
      lifestyleId?: number;
      name?: string;
      value?: string;
      description?: string;
      type?: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
    };
    'org.example.knockin.dto.ChatRequestDetailDto$Response$RequesteeInfo': {
      name?: string;
      lifeStyles?: OpenApiComponents['schemas']['org.example.knockin.dto.ChatRequestDetailDto$Response$Lifestyle'][];
      score?: number;
      createAt?: string;
      isAgree?: boolean;
    };
    'org.example.knockin.dto.ChatRequestDetailDto$Response$RequesterInfo': {
      name?: string;
      lifeStyles?: OpenApiComponents['schemas']['org.example.knockin.dto.ChatRequestDetailDto$Response$Lifestyle'][];
      score?: number;
      createAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.ChatRequestDetailDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.ChatRequestDetailDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoVerificationCompanyListDto$Response': {
      employeeAuth?: OpenApiComponents['schemas']['org.example.knockin.dto.BoVerificationCompanyListDto$Response$EmployeeAuthItem'][];
    };
    'org.example.knockin.dto.BoVerificationCompanyListDto$Response$EmployeeAuthItem': {
      isAccepted?: boolean;
      email?: string;
      createAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoVerificationCompanyListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoVerificationCompanyListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoTermsListDto$Response': {
      terms?: OpenApiComponents['schemas']['org.example.knockin.dto.BoTermsListDto$Response$TermsItem'][];
    };
    'org.example.knockin.dto.BoTermsListDto$Response$TermsItem': {
      id?: number;
      title?: string;
      createAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoTermsListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoTermsListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoTermsDetailDto$Response': {
      terms?: OpenApiComponents['schemas']['org.example.knockin.dto.BoTermsDetailDto$Response$TermsItem'][];
    };
    'org.example.knockin.dto.BoTermsDetailDto$Response$TermsItem': {
      id?: number;
      title?: string;
      contents?: string;
      createAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoTermsDetailDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoTermsDetailDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoRoomTypeListDto$Response': {
      roomType?: OpenApiComponents['schemas']['org.example.knockin.dto.BoRoomTypeListDto$Response$RoomTypeItem'][];
    };
    'org.example.knockin.dto.BoRoomTypeListDto$Response$RoomTypeItem': {
      id?: number;
      name?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoRoomTypeListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoRoomTypeListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoRoomTypeDetailDto$Response': {
      id?: number;
      name?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoRoomTypeDetailDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoRoomTypeDetailDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoNoticeListDto$Response': {
      notices?: OpenApiComponents['schemas']['org.example.knockin.dto.BoNoticeListDto$Response$NoticeItem'][];
    };
    'org.example.knockin.dto.BoNoticeListDto$Response$NoticeItem': {
      id?: number;
      title?: string;
      writer?: string;
      createAt?: string;
      type?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoNoticeListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoNoticeListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoNoticeDetailDto$Response': {
      notice?: OpenApiComponents['schemas']['org.example.knockin.dto.BoNoticeDetailDto$Response$NoticeDetail'];
    };
    'org.example.knockin.dto.BoNoticeDetailDto$Response$NoticeDetail': {
      id?: number;
      title?: string;
      contents?: string;
      writer?: string;
      createAt?: string;
      type?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoNoticeDetailDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoNoticeDetailDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoLifeStylePatternListDto$Response': {
      patterns?: OpenApiComponents['schemas']['org.example.knockin.dto.BoLifeStylePatternListDto$Response$PatternItem'][];
    };
    'org.example.knockin.dto.BoLifeStylePatternListDto$Response$PatternItem': {
      id?: number;
      name?: string;
      type?: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
      details?: OpenApiComponents['schemas']['org.example.knockin.dto.BoLifeStylePatternListDto$Response$PatternItem$DetailItem'][];
    };
    'org.example.knockin.dto.BoLifeStylePatternListDto$Response$PatternItem$DetailItem': {
      values?: string;
      description?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoLifeStylePatternListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoLifeStylePatternListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoLifeStylePatternDetailDto$Response': {
      id?: number;
      name?: string;
      type?: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
      details?: OpenApiComponents['schemas']['org.example.knockin.dto.BoLifeStylePatternDetailDto$Response$DetailItem'][];
    };
    'org.example.knockin.dto.BoLifeStylePatternDetailDto$Response$DetailItem': {
      values?: string;
      description?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoLifeStylePatternDetailDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoLifeStylePatternDetailDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoInquiryListDto$Response': {
      inquiries?: OpenApiComponents['schemas']['org.example.knockin.dto.BoInquiryListDto$Response$InquiryItem'][];
    };
    'org.example.knockin.dto.BoInquiryListDto$Response$InquiryItem': {
      id?: number;
      title?: string;
      writer?: string;
      status?: string;
      createAt?: string;
      type?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoInquiryListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoInquiryListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BoInquiryDetailDto$Response': {
      inquirie?: OpenApiComponents['schemas']['org.example.knockin.dto.BoInquiryDetailDto$Response$InquiryDetail'];
    };
    'org.example.knockin.dto.BoInquiryDetailDto$Response$InquiryDetail': {
      id?: number;
      title?: string;
      contents?: string;
      writer?: string;
      status?: string;
      createAt?: string;
      type?: string;
      reply?: OpenApiComponents['schemas']['org.example.knockin.dto.BoInquiryDetailDto$Response$InquiryDetail$Reply'][];
    };
    'org.example.knockin.dto.BoInquiryDetailDto$Response$InquiryDetail$Reply': {
      id?: number;
      title?: string;
      contents?: string;
      writer?: string;
      createAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BoInquiryDetailDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BoInquiryDetailDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.BlockListDto$Response': {
      blocks?: OpenApiComponents['schemas']['org.example.knockin.dto.BlockListDto$Response$Block'][];
    };
    'org.example.knockin.dto.BlockListDto$Response$Block': {
      userId?: number;
      name?: string;
      createAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.BlockListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.BlockListDto$Response'];
      status?: number;
    };
    'org.example.knockin.global.api.CommonResponseJava.lang.String': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: string;
      status?: number;
    };
    'org.example.knockin.dto.AlarmListDto$Response': {
      alarms?: OpenApiComponents['schemas']['org.example.knockin.dto.AlarmListDto$Response$Alarm'][];
    };
    'org.example.knockin.dto.AlarmListDto$Response$Alarm': {
      title?: string;
      contents?: string;
      isRead?: boolean;
      createAt?: string;
    };
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.AlarmListDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.AlarmListDto$Response'];
      status?: number;
    };
    'org.example.knockin.dto.DeleteUserDto$Response': Record<string, never>;
    'org.example.knockin.global.api.CommonResponseOrg.example.knockin.dto.DeleteUserDto$Response': {
      error?: OpenApiComponents['schemas']['org.example.knockin.global.api.ErrorResponse'];
      data?: OpenApiComponents['schemas']['org.example.knockin.dto.DeleteUserDto$Response'];
      status?: number;
    };
  };
}

export type OpenApiSchemas = OpenApiComponents['schemas'];
export type OpenApiSchema<K extends keyof OpenApiSchemas> = OpenApiSchemas[K];
