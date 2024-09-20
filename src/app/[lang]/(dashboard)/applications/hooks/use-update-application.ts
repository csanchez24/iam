'use client';

import { api } from '@/clients/api';
import { useToast } from '@/components/ui/use-toast';
import { invalidateQueries } from '@/utils/query';
import { useQueryClient } from '@tanstack/react-query';
import { getApplicationQueryKey } from './use-get-application';
import { getApplicationsQueryKey } from './use-get-applications';

export const useUpdateApplication = ({
  onSuccess,
  onError,
}: { onSuccess?(): void; onError?(): void } = {}) => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  return api.application.update.useMutation({
    async onSuccess({ body }) {
      await queryClient.invalidateQueries({
        predicate: invalidateQueries([
          [...getApplicationQueryKey(body.id), body.id],
          getApplicationsQueryKey(),
        ]),
      });
      toast({
        description: 'Application was successfully updated.',
      });
      onSuccess?.();
    },
    onError(e) {
      if (e.status === 400 || e.status === 404 || e.status === 500) {
        toast({
          variant: 'destructive',
          title: 'Unable to update application.',
          description: e.body.message,
        });
      } else {
        toast({
          variant: 'destructive',
          description: 'Something went wrong while updating application.',
        });
      }
      onError?.();
    },
  });
};
