'use client';

import { api } from '@/clients/api';
import { useToast } from '@/components/ui/use-toast';
import { invalidateQueries } from '@/utils/query';
import { useQueryClient } from '@tanstack/react-query';
import { getApplicationsQueryKey } from './use-get-applications';

export const useDeleteApplication = () => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  return api.application.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: invalidateQueries([getApplicationsQueryKey()]),
      });
      toast({
        description: 'Application was successfully deleted.',
      });
    },
    onError() {
      toast({
        variant: 'destructive',
        description: 'Unable to delete application.',
      });
    },
  });
};
