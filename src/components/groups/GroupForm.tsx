"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CreateGroupForm, UpdateGroupForm } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading";
import { GroupsApi } from "@/lib/api/groups";
import { COMPONENTS, VALIDATION, MESSAGES } from "@/lib/translations";
import toast from "react-hot-toast";

const groupFormSchema = z.object({
  name: z
    .string()
    .min(1, VALIDATION.GROUP.NAME_REQUIRED)
    .max(100, VALIDATION.GROUP.NAME_TOO_LONG)
    .trim(),
  description: z
    .string()
    .max(500, VALIDATION.GROUP.DESCRIPTION_TOO_LONG)
    .trim()
    .optional(),
});

type FormData = z.infer<typeof groupFormSchema>;

interface GroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (group?: any) => void;
  group?: any; // For editing
  mode: "create" | "edit";
}

export function GroupForm({
  isOpen,
  onClose,
  onSuccess,
  group,
  mode,
}: GroupFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: group?.name || "",
      description: group?.description || "",
    },
  });

  // Reset form when group changes or dialog opens
  useEffect(() => {
    if (isOpen && group) {
      form.reset({
        name: group.name || "",
        description: group.description || "",
      });
    } else if (isOpen && !group) {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [isOpen, group, form]);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (mode === "create") {
        const newGroup = await GroupsApi.createGroup(data as CreateGroupForm);
        toast.success(MESSAGES.SUCCESS.CREATED);
        onSuccess(newGroup);
      } else {
        if (!group?.id)
          throw new Error(COMPONENTS.GROUP_FORM.ERROR_ID_REQUIRED);
        const updatedGroup = await GroupsApi.updateGroup(
          group.id,
          data as UpdateGroupForm,
        );
        toast.success(MESSAGES.SUCCESS.UPDATED);
        onSuccess(updatedGroup);
      }
    } catch (error) {
      console.error(COMPONENTS.GROUP_FORM.LOG_PREFIX, error);
      toast.error(
        error instanceof Error
          ? error.message
          : MESSAGES.ERROR.SOMETHING_WENT_WRONG,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? COMPONENTS.GROUP_FORM.TITLE_CREATE
              : COMPONENTS.GROUP_FORM.TITLE_EDIT}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? COMPONENTS.GROUP_FORM.DESCRIPTION_CREATE
              : COMPONENTS.GROUP_FORM.DESCRIPTION_EDIT}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{COMPONENTS.GROUP_FORM.LABEL_NAME}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={COMPONENTS.GROUP_FORM.PLACEHOLDER_NAME}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    {COMPONENTS.GROUP_FORM.DESCRIPTION_NAME}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {COMPONENTS.GROUP_FORM.LABEL_DESCRIPTION}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        COMPONENTS.GROUP_FORM.PLACEHOLDER_DESCRIPTION
                      }
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    {COMPONENTS.GROUP_FORM.DESCRIPTION_DESCRIPTION}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                {COMPONENTS.GROUP_FORM.BUTTON_CANCEL}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoadingSpinner className="mr-2" />}
                {mode === "create"
                  ? COMPONENTS.GROUP_FORM.BUTTON_CREATE
                  : COMPONENTS.GROUP_FORM.BUTTON_UPDATE}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
