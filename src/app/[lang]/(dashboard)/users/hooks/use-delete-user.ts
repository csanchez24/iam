'use client';

import { api } from '@/clients/api';
import { useToast } from '@/components/ui/use-toast';
import { invalidateQueries } from '@/utils/query';
import { useQueryClient } from '@tanstack/react-query';
import { getUsersQueryKey } from './use-get-users';

export const useDeleteUser = () => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  return api.user.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: invalidateQueries([getUsersQueryKey()]),
      });
      toast({
        description: 'User was successfully deleted.',
      });
    },
    onError() {
      toast({
        variant: 'destructive',
        description: 'Unable to delete user.',
      });
    },
  });
};
