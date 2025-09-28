package com.studysync.dto;

import com.studysync.model.enums.MatchStatus;

public class MatchSummaryDto {
    private Long matchId;
    private Long partnerId;
    private String partnerName;
    private String partnerMajor;
    private String partnerStudyYear;
    private String partnerStudyStyle;
    private String partnerProfilePictureUrl;
    private MatchStatus status;
    private int compatibilityScore;
    private String lastMessage;
    private String lastMessageTime;

    public MatchSummaryDto() {
    }

    public MatchSummaryDto(Long matchId, Long partnerId, String partnerName, String partnerMajor,
            String partnerStudyYear,
            String partnerStudyStyle, String partnerProfilePictureUrl, MatchStatus status, int compatibilityScore,
            String lastMessage, String lastMessageTime) {
        this.matchId = matchId;
        this.partnerId = partnerId;
        this.partnerName = partnerName;
        this.partnerMajor = partnerMajor;
        this.partnerStudyYear = partnerStudyYear;
        this.partnerStudyStyle = partnerStudyStyle;
        this.partnerProfilePictureUrl = partnerProfilePictureUrl;
        this.status = status;
        this.compatibilityScore = compatibilityScore;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
    }

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public Long getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(Long partnerId) {
        this.partnerId = partnerId;
    }

    public String getPartnerName() {
        return partnerName;
    }

    public void setPartnerName(String partnerName) {
        this.partnerName = partnerName;
    }

    public String getPartnerMajor() {
        return partnerMajor;
    }

    public void setPartnerMajor(String partnerMajor) {
        this.partnerMajor = partnerMajor;
    }

    public String getPartnerStudyYear() {
        return partnerStudyYear;
    }

    public void setPartnerStudyYear(String partnerStudyYear) {
        this.partnerStudyYear = partnerStudyYear;
    }

    public String getPartnerStudyStyle() {
        return partnerStudyStyle;
    }

    public void setPartnerStudyStyle(String partnerStudyStyle) {
        this.partnerStudyStyle = partnerStudyStyle;
    }

    public String getPartnerProfilePictureUrl() {
        return partnerProfilePictureUrl;
    }

    public void setPartnerProfilePictureUrl(String partnerProfilePictureUrl) {
        this.partnerProfilePictureUrl = partnerProfilePictureUrl;
    }

    public MatchStatus getStatus() {
        return status;
    }

    public void setStatus(MatchStatus status) {
        this.status = status;
    }

    public int getCompatibilityScore() {
        return compatibilityScore;
    }

    public void setCompatibilityScore(int compatibilityScore) {
        this.compatibilityScore = compatibilityScore;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public String getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(String lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }
}
