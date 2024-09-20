'use client';

import { api } from '@/clients/api';
import { useToast } from '@/components/ui/use-toast';
import { invalidateQueries } from '@/utils/query';
import { useQueryClient } from '@tanstack/react-query';
import { getLabelsQueryKey } from './use-get-labels';

export const useDeleteLabel = ({ onSuccess }: { onSuccess?(): void }) => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  return api.label.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: invalidateQueries([getLabelsQueryKey()]),
      });
      toast({
        description: 'Label was successfully deleted.',
      });
      onSuccess?.();
    },
    onError() {
      toast({
        variant: 'destructive',
        description: 'Unable to delete label.',
      });
    },
  });
};
