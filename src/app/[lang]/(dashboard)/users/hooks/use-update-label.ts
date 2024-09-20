'use client';

import { api } from '@/clients/api';
import { useToast } from '@/components/ui/use-toast';
import { invalidateQueries } from '@/utils/query';
import { useQueryClient } from '@tanstack/react-query';
import { getLabelQueryKey } from './use-get-label';
import { getLabelsQueryKey } from './use-get-labels';

export const useUpdateLabel = ({
  onSuccess,
  onError,
}: { onSuccess?(): void; onError?(): void } = {}) => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  return api.label.update.useMutation({
    async onSuccess({ body }) {
      await queryClient.invalidateQueries({
        predicate: invalidateQueries([
          [...getLabelQueryKey(body.id), body.id],
          getLabelsQueryKey(),
        ]),
      });
      toast({
        description: 'Label was successfully updated.',
      });
      onSuccess?.();
    },
    onError(e) {
      if (e.status === 400 || e.status === 404 || e.status === 500) {
        toast({
          variant: 'destructive',
          title: 'Unable to update label.',
          description: e.body.message,
        });
      } else {
        toast({
          variant: 'destructive',
          description: 'Something went wrong while updating label.',
        });
      }
      onError?.();
    },
  });
};
