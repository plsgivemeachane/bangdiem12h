import React, { useState } from "react";
import { X, Save, Plus, Trash2 } from "lucide-react";
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
import { GroupsApi } from "@/lib/api/groups";
import { ScoringRule } from "@/types";
import { COMPONENTS, MESSAGES } from "@/lib/translations";
import toast from "react-hot-toast";

interface RuleCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRuleCreated?: (rule: ScoringRule) => void;
  existingRule?: ScoringRule | null;
  mode?: "create" | "edit";
  isAdmin?: boolean; // To determine if user can create global rules
}

interface RuleCriteria {
  [key: string]: any;
}

export function RuleCreationModal({
  isOpen,
  onClose,
  onRuleCreated,
  existingRule,
  mode = "create",
  isAdmin = false,
}: RuleCreationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: existingRule?.name || "",
    description: existingRule?.description || "",
    points: existingRule?.points?.toString() || "",
    criteria: existingRule?.criteria || { type: "manual", conditions: [] },
  });
  const [autoAddToGroups, setAutoAddToGroups] = useState(false);

  // Update form data when existing rule changes
  React.useEffect(() => {
    if (existingRule) {
      setFormData({
        name: existingRule.name || "",
        description: existingRule.description || "",
        points: existingRule.points?.toString() || "",
        criteria: existingRule.criteria || { type: "manual", conditions: [] },
      });
    } else {
      // Reset checkbox when creating new rule
      setAutoAddToGroups(false);
    }
  }, [existingRule]);

  const [criteriaType, setCriteriaType] = useState<"manual" | "automatic">(
    "manual",
  );
  const [criteriaConditions, setCriteriaConditions] = useState<RuleCriteria[]>(
    [],
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCriteriaTypeChange = (type: "manual" | "automatic") => {
    setCriteriaType(type);
    setFormData((prev) => ({
      ...prev,
      criteria: {
        type,
        conditions: type === "automatic" ? [] : undefined,
      },
    }));
  };

  const handleAddCondition = () => {
    setCriteriaConditions((prev) => [
      ...prev,
      {
        field: "",
        operator: "",
        value: "",
      },
    ]);
  };

  const handleRemoveCondition = (index: number) => {
    setCriteriaConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConditionChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    setCriteriaConditions((prev) =>
      prev.map((condition, i) =>
        i === index ? { ...condition, [field]: value } : condition,
      ),
    );
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error(COMPONENTS.RULE_CREATION.ERROR_NAME_REQUIRED);
      return false;
    }

    if (!formData.points || isNaN(parseInt(formData.points))) {
      toast.error(COMPONENTS.RULE_CREATION.ERROR_INVALID_POINTS);
      return false;
    }

    return true;
  };

  const buildCriteria = () => {
    if (criteriaType === "manual") {
      return { type: "manual" };
    }

    // Build automatic criteria from conditions
    const conditions = criteriaConditions
      .filter((cond) => cond.field && cond.operator)
      .map((cond) => ({
        field: cond.field,
        operator: cond.operator,
        value: cond.value,
      }));

    return {
      type: "automatic",
      conditions,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const criteria = buildCriteria();
      const points = parseInt(formData.points);

      if (mode === "edit" && existingRule) {
        // Update existing rule
        const updatedRule = await GroupsApi.updateScoringRule(existingRule.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          criteria,
          points,
        });

        if (!updatedRule) {
          throw new Error(
            "Failed to update rule - invalid response from server",
          );
        }

        toast.success(
          COMPONENTS.RULE_CREATION.SUCCESS_UPDATED.replace(
            "{name}",
            updatedRule.name,
          ),
        );
        onRuleCreated?.(updatedRule);

        // Reset form first
        setFormData({
          name: "",
          description: "",
          points: "",
          criteria: { type: "manual", conditions: [] },
        });
        setCriteriaConditions([]);
        setCriteriaType("manual");
        setAutoAddToGroups(false);

        // Close modal after form reset
        onClose();
      } else {
        // Create new rule
        const requestBody: any = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          criteria,
          points,
        };

        // Only include autoAddToGroups if it's true to avoid sending unnecessary data
        if (autoAddToGroups) {
          requestBody.autoAddToGroups = true;
        }

        const response = await GroupsApi.createScoringRule(requestBody);

        // Ensure response contains the expected data
        if (!response || !response.scoringRule) {
          throw new Error(
            "Invalid response from server - missing scoring rule data",
          );
        }

        const newRule = response.scoringRule;

        // Show additional success message if rule was auto-added to groups
        if (response.autoAddToGroups && response.groupsAdded > 0) {
          toast.success(
            `Quy tắc "${newRule.name}" đã được tạo và tự động thêm vào ${response.groupsAdded} nhóm!`,
          );
        }

        toast.success(
          COMPONENTS.RULE_CREATION.SUCCESS_CREATED.replace(
            "{name}",
            newRule.name,
          ),
        );
        onRuleCreated?.(newRule);

        // Reset form first
        setFormData({
          name: "",
          description: "",
          points: "",
          criteria: { type: "manual", conditions: [] },
        });
        setCriteriaConditions([]);
        setCriteriaType("manual");
        setAutoAddToGroups(false);

        // Close modal after form reset
        onClose();
      }
    } catch (error) {
      console.error("Failed to create rule:", error);
      if (error instanceof Error) {
        toast.error(error.message || COMPONENTS.RULE_CREATION.ERROR_CREATE);
      } else {
        toast.error(COMPONENTS.RULE_CREATION.ERROR_CREATE);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      // Reset form state
      setFormData({
        name: existingRule?.name || "",
        description: existingRule?.description || "",
        points: existingRule?.points?.toString() || "",
        criteria: existingRule?.criteria || { type: "manual", conditions: [] },
      });
      setCriteriaConditions([]);
      setCriteriaType("manual");
      setAutoAddToGroups(false);

      // Close modal
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">
              {mode === "create"
                ? COMPONENTS.RULE_CREATION.TITLE_CREATE
                : COMPONENTS.RULE_CREATION.TITLE_EDIT}
            </CardTitle>
            <CardDescription>
              {COMPONENTS.RULE_CREATION.DESCRIPTION}
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
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {COMPONENTS.RULE_CREATION.SECTION_BASIC_INFO}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">
                    {COMPONENTS.RULE_CREATION.LABEL_RULE_NAME}
                  </Label>
                  <Input
                    id="rule-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder={COMPONENTS.RULE_CREATION.PLACEHOLDER_NAME}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-points">
                    {COMPONENTS.RULE_CREATION.LABEL_POINTS}
                  </Label>
                  <Input
                    id="rule-points"
                    type="number"
                    value={formData.points}
                    onChange={(e) =>
                      handleInputChange("points", e.target.value)
                    }
                    placeholder={COMPONENTS.RULE_CREATION.PLACEHOLDER_POINTS}
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {COMPONENTS.RULE_CREATION.DESCRIPTION_POINTS}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-description">
                  {COMPONENTS.RULE_CREATION.LABEL_DESCRIPTION}
                </Label>
                <Textarea
                  id="rule-description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder={COMPONENTS.RULE_CREATION.PLACEHOLDER_DESCRIPTION}
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Scoring Criteria */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {COMPONENTS.RULE_CREATION.SECTION_SCORING_CRITERIA}
                </h3>
                <Select
                  value={criteriaType}
                  onValueChange={handleCriteriaTypeChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">
                      {COMPONENTS.RULE_CREATION.CRITERIA_MANUAL}
                    </SelectItem>
                    <SelectItem value="automatic">
                      {COMPONENTS.RULE_CREATION.CRITERIA_AUTOMATIC}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant={
                      criteriaType === "manual" ? "default" : "secondary"
                    }
                  >
                    {criteriaType === "manual"
                      ? COMPONENTS.RULE_CREATION.BADGE_MANUAL
                      : COMPONENTS.RULE_CREATION.BADGE_AUTOMATIC}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {criteriaType === "manual"
                      ? COMPONENTS.RULE_CREATION.DESCRIPTION_MANUAL
                      : COMPONENTS.RULE_CREATION.DESCRIPTION_AUTOMATIC}
                  </span>
                </div>

                {criteriaType === "automatic" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {COMPONENTS.RULE_CREATION.LABEL_CONDITIONS}
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddCondition}
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {COMPONENTS.RULE_CREATION.BUTTON_ADD_CONDITION}
                      </Button>
                    </div>

                    {criteriaConditions.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        {COMPONENTS.RULE_CREATION.NO_CONDITIONS}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {criteriaConditions.map((condition, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 border rounded"
                          >
                            <Input
                              placeholder={
                                COMPONENTS.RULE_CREATION.PLACEHOLDER_FIELD
                              }
                              value={condition.field}
                              onChange={(e) =>
                                handleConditionChange(
                                  index,
                                  "field",
                                  e.target.value,
                                )
                              }
                              className="flex-1"
                              disabled={isLoading}
                            />
                            <Select
                              value={condition.operator}
                              onValueChange={(value) =>
                                handleConditionChange(index, "operator", value)
                              }
                              disabled={isLoading}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">
                                  {COMPONENTS.RULE_CREATION.OPERATOR_EQUALS}
                                </SelectItem>
                                <SelectItem value="not_equals">
                                  {COMPONENTS.RULE_CREATION.OPERATOR_NOT_EQUALS}
                                </SelectItem>
                                <SelectItem value="greater_than">
                                  {
                                    COMPONENTS.RULE_CREATION
                                      .OPERATOR_GREATER_THAN
                                  }
                                </SelectItem>
                                <SelectItem value="less_than">
                                  {COMPONENTS.RULE_CREATION.OPERATOR_LESS_THAN}
                                </SelectItem>
                                <SelectItem value="contains">
                                  {COMPONENTS.RULE_CREATION.OPERATOR_CONTAINS}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder={
                                COMPONENTS.RULE_CREATION.PLACEHOLDER_VALUE
                              }
                              value={condition.value}
                              onChange={(e) =>
                                handleConditionChange(
                                  index,
                                  "value",
                                  e.target.value,
                                )
                              }
                              className="flex-1"
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCondition(index)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {criteriaType === "manual" && (
                  <p className="text-sm text-muted-foreground">
                    {COMPONENTS.RULE_CREATION.MANUAL_DESCRIPTION}
                  </p>
                )}
              </div>
            </div>

            {/* Auto-add to groups checkbox (only for admin users creating new rules) */}
            {mode === "create" && isAdmin && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="auto-add-to-groups"
                    checked={autoAddToGroups}
                    onCheckedChange={(checked) => setAutoAddToGroups(!!checked)}
                    disabled={isLoading}
                  />
                  <div className="grid gap-2">
                    <Label
                      htmlFor="auto-add-to-groups"
                      className="text-sm font-medium"
                    >
                      {COMPONENTS.RULE_CREATION.AUTO_ADD_TO_GROUPS_CHECKBOX}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {COMPONENTS.RULE_CREATION.AUTO_ADD_TO_GROUPS_DESCRIPTION}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                {COMPONENTS.RULE_CREATION.BUTTON_CANCEL}
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-32">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {COMPONENTS.RULE_CREATION.LOADING}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {mode === "create"
                      ? COMPONENTS.RULE_CREATION.BUTTON_CREATE
                      : COMPONENTS.RULE_CREATION.BUTTON_UPDATE}
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
