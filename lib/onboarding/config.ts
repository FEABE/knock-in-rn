/**
 * 온보딩 저장/수정(POST/PUT) API 호출 on/off 플래그.
 *
 * 외부 UT 동안에는 저장/수정을 하지 않기로 하여 false 로 둔다.
 * 이때 각 스텝의 "다음"은 API 없이 다음 스텝으로 자연스럽게 넘어간다.
 * UT 종료 후 true 로 되돌리면 기본정보1/2/3 및 일괄저장 API가 다시 호출된다.
 */
export const ONBOARDING_WRITE_ENABLED = false;
