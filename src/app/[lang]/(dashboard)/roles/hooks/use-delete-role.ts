'use client';

import { api } from '@/clients/api';
import { useToast } from '@/components/ui/use-toast';
import { invalidateQueries } from '@/utils/query';
import { useQueryClient } from '@tanstack/react-query';
import { getRolesQueryKey } from './use-get-roles';

export const useDeleteRole = () => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  return api.role.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: invalidateQueries([getRolesQueryKey()]),
      });
      toast({
        description: 'Role was successfully deleted.',
      });
    },
    onError() {
      toast({
        variant: 'destructive',
        description: 'Unable to delete role.',
      });
    },
  });
};
