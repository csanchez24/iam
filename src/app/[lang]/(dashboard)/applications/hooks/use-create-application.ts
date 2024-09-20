'use client';

import { api } from '@/clients/api';
import { useToast } from '@/components/ui/use-toast';
import { invalidateQueries } from '@/utils/query';
import { useQueryClient } from '@tanstack/react-query';
import { getApplicationsQueryKey } from './use-get-applications';

export const useCreateApplication = ({
  onSuccess,
  onError,
}: { onSuccess?(): void; onError?(): void } = {}) => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  return api.application.create.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({
        predicate: invalidateQueries([getApplicationsQueryKey()]),
      });
      toast({
        description: 'Application was successfully created.',
      });
      onSuccess?.();
    },
    onError(e) {
      if (e.status === 400 || e.status === 500) {
        toast({
          variant: 'destructive',
          title: 'Unable to create application',
          description: e.body.message,
        });
      } else {
        toast({
          variant: 'destructive',
          description: 'Something went wrong. Try again!',
        });
      }
      onError?.();
    },
  });
};
