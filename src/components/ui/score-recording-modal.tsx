"use client";

import React, { useState } from "react";
import { X, Save, Award, Calendar, FileText, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GroupsApi } from "@/lib/api/groups";
import { ScoringRule, GroupMember } from "@/types";
import { SCORE_RECORDING } from "@/lib/translations";
import toast from "react-hot-toast";

interface ScoreRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScoreRecorded?: (scoreRecord: any) => void;
  groupId: string;
  groupName: string;
  availableRules: ScoringRule[];
  groupMembers: GroupMember[];
}

export function ScoreRecordingModal({
  isOpen,
  onClose,
  onScoreRecorded,
  groupId,
  groupName,
  availableRules,
  groupMembers,
}: ScoreRecordingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [overridePoints, setOverridePoints] = useState(false);
  const [formData, setFormData] = useState({
    targetUserId: "",
    ruleId: "",
    points: "",
    notes: "",
    recordedAt: new Date().toISOString().split("T")[0], // Default to today
  });

  const selectedRule = availableRules.find(
    (rule) => rule.id === formData.ruleId,
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-fill points when rule is selected
    if (field === "ruleId" && value) {
      const rule = availableRules.find((r) => r.id === value);
      if (rule) {
        setFormData((prev) => ({
          ...prev,
          points: rule.points.toString(),
        }));
        // Reset override when rule changes
        setOverridePoints(false);
      }
    }
  };

  const validateForm = () => {
    if (!formData.targetUserId) {
      toast.error(SCORE_RECORDING.VALIDATION.SELECT_MEMBER);
      return false;
    }

    if (!formData.ruleId) {
      toast.error(SCORE_RECORDING.VALIDATION.SELECT_RULE);
      return false;
    }

    // Only validate points if override is enabled
    if (overridePoints) {
      if (!formData.points || isNaN(parseFloat(formData.points))) {
        toast.error(SCORE_RECORDING.VALIDATION.VALID_POINTS);
        return false;
      }

      if (parseFloat(formData.points) <= 0) {
        toast.error(SCORE_RECORDING.VALIDATION.POINTS_GREATER_THAN_ZERO);
        return false;
      }

      const points = parseFloat(formData.points);
      if (selectedRule && points !== selectedRule.points) {
        // Allow custom points, but warn if different from rule's default
        const confirmMessage =
          SCORE_RECORDING.MESSAGES.CONFIRM_OVERRIDE.replace(
            "{customPoints}",
            points.toString(),
          )
            .replace("{ruleName}", selectedRule.name)
            .replace("{defaultPoints}", selectedRule.points.toString());

        if (!window.confirm(confirmMessage)) {
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Use rule's default points if override is disabled
      const finalPoints =
        overridePoints && formData.points
          ? parseFloat(formData.points)
          : selectedRule?.points;

      const scoreData = {
        groupId,
        ruleId: formData.ruleId,
        targetUserId: formData.targetUserId,
        points: finalPoints,
        notes: formData.notes.trim() || undefined,
        recordedAt: formData.recordedAt
          ? new Date(formData.recordedAt)
          : undefined,
      };

      const newScoreRecord = await GroupsApi.createScoreRecord(scoreData);

      const successMessage = SCORE_RECORDING.MESSAGES.SUCCESS.replace(
        "{points}",
        newScoreRecord.points.toString(),
      );
      toast.success(successMessage);
      onScoreRecorded?.(newScoreRecord);
      onClose();

      // Reset form
      setFormData({
        targetUserId: "",
        ruleId: "",
        points: "",
        notes: "",
        recordedAt: new Date().toISOString().split("T")[0],
      });
      setOverridePoints(false);
    } catch (error) {
      console.error(SCORE_RECORDING.MESSAGES.ERROR_LOG_PREFIX, error);
      if (error instanceof Error) {
        toast.error(error.message || SCORE_RECORDING.MESSAGES.ERROR_GENERAL);
      } else {
        toast.error(SCORE_RECORDING.MESSAGES.ERROR_GENERAL);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // Reset form
      setFormData({
        targetUserId: "",
        ruleId: "",
        points: "",
        notes: "",
        recordedAt: new Date().toISOString().split("T")[0],
      });
      setOverridePoints(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5" />
              {SCORE_RECORDING.TITLE}
            </CardTitle>
            <CardDescription>
              Thêm bản ghi điểm mới vào {groupName}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="member-select"
                className="text-base font-medium flex items-center gap-2"
              >
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    U
                  </AvatarFallback>
                </Avatar>
                {SCORE_RECORDING.LABEL_MEMBER}
              </Label>
              <Select
                value={formData.targetUserId}
                onValueChange={(value) =>
                  handleInputChange("targetUserId", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue
                    placeholder={SCORE_RECORDING.PLACEHOLDER_MEMBER}
                  />
                </SelectTrigger>
                <SelectContent>
                  {groupMembers.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      <div className="flex items-center justify-between w-full">
                        <span>{member.user?.name || member.user?.email}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {member.role.toLowerCase()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {SCORE_RECORDING.HELPER_MEMBER}
              </p>
            </div>

            {/* Rule Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="rule-select" className="text-base font-medium">
                  {SCORE_RECORDING.LABEL_RULE}
                </Label>
                <Select
                  value={formData.ruleId}
                  onValueChange={(value) => handleInputChange("ruleId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue
                      placeholder={SCORE_RECORDING.PLACEHOLDER_RULE}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRules
                      .filter((rule) => rule.isActive)
                      .map((rule) => (
                        <SelectItem key={rule.id} value={rule.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{rule.name}</span>
                            <Badge variant="outline" className="ml-2">
                              +{rule.points} {SCORE_RECORDING.UNIT_POINTS}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {availableRules.filter((rule) => rule.isActive).length ===
                  0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {SCORE_RECORDING.NO_ACTIVE_RULES}
                  </p>
                )}
              </div>

              {/* Selected Rule Info */}
              {selectedRule && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{selectedRule.name}</h4>
                        {selectedRule.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedRule.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-primary">
                        <Target className="h-3 w-3 mr-1" />
                        {SCORE_RECORDING.BADGE_POINTS.replace(
                          "{points}",
                          selectedRule.points.toString(),
                        )}
                      </Badge>
                    </div>

                    {/* Override Points Checkbox */}
                    <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                      <Checkbox
                        id="override-points"
                        checked={overridePoints}
                        onCheckedChange={(checked: boolean) =>
                          setOverridePoints(checked)
                        }
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor="override-points"
                        className="text-sm font-normal cursor-pointer"
                      >
                        {SCORE_RECORDING.OVERRIDE_CHECKBOX.replace(
                          "{points}",
                          selectedRule.points.toString(),
                        )}
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Points - Only show when override is enabled */}
            {overridePoints && selectedRule && (
              <div className="space-y-2">
                <Label htmlFor="points" className="text-base font-medium">
                  {SCORE_RECORDING.LABEL_POINTS}
                </Label>
                <div className="relative">
                  <Input
                    id="points"
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.points}
                    onChange={(e) =>
                      handleInputChange("points", e.target.value)
                    }
                    placeholder={selectedRule.points.toString()}
                    disabled={isLoading}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-sm text-muted-foreground">
                      {SCORE_RECORDING.UNIT_POINTS}
                    </span>
                  </div>
                </div>
                {parseFloat(formData.points) !== selectedRule.points &&
                  formData.points && (
                    <p className="text-sm text-blue-600">
                      {SCORE_RECORDING.WARNING_DIFFERENT.replace(
                        "{defaultPoints}",
                        selectedRule.points.toString(),
                      ).replace("{customPoints}", formData.points)}
                    </p>
                  )}
              </div>
            )}

            {/* Date */}
            <div className="space-y-2">
              <Label
                htmlFor="recorded-date"
                className="text-base font-medium flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                {SCORE_RECORDING.LABEL_DATE}
              </Label>
              <Input
                id="recorded-date"
                type="date"
                value={formData.recordedAt}
                onChange={(e) =>
                  handleInputChange("recordedAt", e.target.value)
                }
                disabled={isLoading}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-base font-medium flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {SCORE_RECORDING.LABEL_NOTES}
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder={SCORE_RECORDING.PLACEHOLDER_NOTES}
                rows={3}
                disabled={isLoading}
                maxLength={500}
              />
              <p className="text-sm text-muted-foreground">
                {SCORE_RECORDING.CHARACTER_COUNT.replace(
                  "{count}",
                  formData.notes.length.toString(),
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                {SCORE_RECORDING.BUTTON_CANCEL}
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.targetUserId ||
                  !formData.ruleId ||
                  (overridePoints && !formData.points) ||
                  availableRules.filter((rule) => rule.isActive).length === 0
                }
                className="min-w-32"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {SCORE_RECORDING.BUTTON_LOADING}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {SCORE_RECORDING.BUTTON_SAVE}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
